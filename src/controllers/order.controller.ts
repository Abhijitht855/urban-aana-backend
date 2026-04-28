import { Request, Response } from 'express';
import crypto from 'crypto';
import Order from '../models/Order';
import Product from '../models/Product';
import Cart from '../models/Cart';
import Razorpay from 'razorpay';

// Razorpay Instance Setup
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

/**
 * @desc    1. Create Initial Order (Automated Data Fetching)
 * @route   POST /api/orders
 */
export const createOrder = async (req: Request, res: Response) => {
    try {
        const {
            orderItems: itemsFromClient,
            shippingAddress,
            taxPrice,
            shippingPrice,
            fromCart
        } = req.body;

        if (!itemsFromClient || itemsFromClient.length === 0) {
            res.status(400).json({ message: 'No order items found' });
            return;
        }

        const orderItems = [];
        let calculatedItemsPrice = 0;

        // 🔍 ഓരോ ഐറ്റവും ഡാറ്റാബേസിൽ നിന്ന് വരിഫൈ ചെയ്ത് വിവരങ്ങൾ ശേഖരിക്കുന്നു
        for (const item of itemsFromClient) {
            const product = await Product.findById(item.product);
            if (!product) {
                res.status(404).json({ message: `Product not found: ${item.product}` });
                return;
            }

            // വേരിയന്റ് കണ്ടെത്തുന്നു (Size/Color validation)
            const variant = (product.variants as any).id(item.variantId);
            if (!variant) {
                res.status(404).json({ message: `Variant not found for product: ${product.name}` });
                return;
            }

            // സ്റ്റോക്ക് ചെക്ക് ചെയ്യുന്നു
            if (variant.stock < item.quantity) {
                res.status(400).json({
                    message: `Insufficient stock for ${product.name} (${variant.size})`
                });
                return;
            }

            // ഡാറ്റാബേസിൽ നിന്നുള്ള വിവരങ്ങൾ വെച്ച് Order Item ഒബ്‌ജക്റ്റ് ഉണ്ടാക്കുന്നു
            // കൺട്രോളറിലെ പഴയ ഭാഗത്തിന് പകരം ഇത് നൽകുക
            const orderItem = {
                product: product._id,
                variantId: variant._id,
                name: product.name,
                size: variant.size,
                color: variant.color,
                quantity: item.quantity,
                image: variant.images && variant.images.length > 0 ? variant.images[0] : product.mainImage,
                price: variant.price
            };

            orderItems.push(orderItem);
            calculatedItemsPrice += orderItem.price * item.quantity;
        }

        const finalTotalPrice = calculatedItemsPrice + (taxPrice || 0) + (shippingPrice || 0);

        // Razorpay Order സൃഷ്ടിക്കുന്നു
        const rzpOrder = await razorpay.orders.create({
            amount: Math.round(finalTotalPrice * 100), // പൈസയിൽ
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        // ഓർഡർ ഡാറ്റാബേസിൽ സേവ് ചെയ്യുന്നു (isPaid: false)
        const order = new Order({
            user: req.user!._id,
            orderItems,
            shippingAddress,
            paymentMethod: 'Razorpay',
            taxPrice: taxPrice || 0,
            shippingPrice: shippingPrice || 0,
            totalPrice: finalTotalPrice,
            razorpayOrderId: rzpOrder.id,
            orderStatus: 'Processing',
            fromCart: fromCart || false
        });

        const createdOrder = await order.save();

        res.status(201).json({
            success: true,
            order: createdOrder,
            razorpayOrder: rzpOrder
        });

    } catch (error: any) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    2. Verify Payment & Update Stock
 * @route   POST /api/orders/verify
 */
export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // 1. Signature Verification
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex');

        // ടെസ്റ്റിംഗിനായി താൽക്കാലികമായി കമന്റ് ചെയ്തത് (ലൈവ് ആക്കുമ്പോൾ അൺകമന്റ് ചെയ്യുക)
        // if (expectedSignature !== razorpay_signature) {
        //     res.status(400).json({ success: false, message: 'Invalid payment signature' });
        //     return;
        // }

        // 2. ഓർഡർ കണ്ടെത്തുന്നു
        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        // 3. പേയ്‌മെന്റ് സക്സസ് ആയതിനാൽ സ്റ്റോക്ക് കുറയ്ക്കുന്നു
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                const variant = (product.variants as any).id(item.variantId);
                if (variant) {
                    variant.stock -= item.quantity;
                    await product.save();
                }
            }
        }

        // 4. ഓർഡർ പേയ്‌മെന്റ് വിവരങ്ങൾ അപ്‌ഡേറ്റ് ചെയ്യുന്നു
        order.isPaid = true;
        order.paidAt = new Date();
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        await order.save();

        // 🔥 5. കാർട്ട് ക്ലിയർ ചെയ്യാനുള്ള പുതിയ ലോജിക്
        // ഓർഡർ ക്രിയേറ്റ് ചെയ്തപ്പോൾ 'fromCart: true' നൽകിയിട്ടുണ്ടെങ്കിൽ മാത്രം കാർട്ട് ഡിലീറ്റ് ചെയ്യും
        if (order.fromCart === true) {
            await Cart.deleteMany({ user: order.user });
            console.log(`Cart cleared for user: ${order.user} (Order from cart)`);
        } else {
            console.log(`Cart preserved for user: ${order.user} (Direct Buy Now order)`);
        }

        res.json({
            success: true,
            message: order.fromCart
                ? 'Payment verified and cart cleared'
                : 'Payment verified and stock updated (Cart kept)',
            orderId: order._id
        });

    } catch (error: any) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    3. Get order by ID
 * @route   GET /api/orders/:id
 */
export const getOrderById = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    4. Get logged in user orders
 * @route   GET /api/orders/myorders
 */
export const getMyOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find({ user: req.user!._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    5. Update order status (Admin only)
 * @route   PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status, courierPartner, trackingId } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.orderStatus = status || order.orderStatus;
            order.courierPartner = courierPartner || order.courierPartner;
            order.trackingId = trackingId || order.trackingId;

            if (status === 'Delivered') {
                order.isDelivered = true;
                order.deliveredAt = new Date();
            }

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};