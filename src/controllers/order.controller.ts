import { Request, Response } from 'express';
import crypto from 'crypto';
import Order from '../models/Order';
import Product from '../models/Product';
import Cart from '../models/Cart';
import Razorpay from 'razorpay';
import { getShippingRate, bookDTDCOrder } from './shipping.controller';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});


const finalizeOrderPayment = async (order: any, paymentId: string, signature: string) => {
    const result = await Order.updateOne(
        { _id: order._id, isPaid: false },
        {
            $set: {
                isPaid: true,
                paidAt: new Date(),
                razorpayPaymentId: paymentId,
                razorpaySignature: signature
            }
        }
    );

    if (result.modifiedCount === 0) return;

    for (const item of order.orderItems) {
        await Product.updateOne(
            { _id: item.product, "variants._id": item.variantId, "variants.sizes._id": item.sizeId },
            { $inc: { "variants.$[v].sizes.$[s].stock": -item.quantity } },
            { arrayFilters: [{ "v._id": item.variantId }, { "s._id": item.sizeId }] }
        );
    }

    if (order.fromCart) {
        await Cart.deleteMany({ user: order.user });
    }
};

// 1. Create Initial Order
export const createOrder = async (req: Request, res: Response) => {
    try {
        const { orderItems: itemsFromClient, shippingAddress, fromCart } = req.body;

        if (!itemsFromClient || itemsFromClient.length === 0) {
            return res.status(400).json({ message: 'No order items found' });
        }

        let userCart: any[] = [];
        if (fromCart) {
            userCart = await Cart.find({ user: req.user!._id });
            if (userCart.length === 0) return res.status(400).json({ message: 'Cart is empty' });
        }

        const orderItems = [];
        let calculatedItemsPrice = 0;
        let totalWeight = 0;

        for (const item of itemsFromClient) {
            const product = await Product.findOne({ _id: item.product, isDeleted: false });
            if (!product) return res.status(404).json({ message: `Product not found` });

            const variant = (product.variants as any).id(item.variantId);

            if (!variant || variant.isDeleted) {
                return res.status(404).json({ message: `Variant not found for ${product.name}` });
            }

            const sizeEntry = (variant.sizes as any).id(item.sizeId);

            if (!sizeEntry) {
                return res.status(404).json({ message: `Size not found for ${product.name}` });
            }

            if (fromCart) {
                const cartItem = userCart.find(c =>
                    c.product.toString() === item.product.toString() &&
                    c.variantId.toString() === item.variantId.toString() &&
                    c.sizeId.toString() === item.sizeId.toString()
                );
                if (!cartItem || item.quantity > cartItem.quantity) {
                    return res.status(400).json({ message: `Invalid quantity for ${product.name}` });
                }
            }

            if (sizeEntry.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }

            orderItems.push({
                product: product._id,
                variantId: variant._id,
                sizeId: sizeEntry._id,
                name: product.name,
                size: sizeEntry.size,
                color: variant.color,
                quantity: item.quantity,
                image: variant.images?.[0] || product.mainImage,
                price: sizeEntry.price
            });

            calculatedItemsPrice += sizeEntry.price * item.quantity;
            totalWeight += (product.weight || 0.5) * item.quantity;
        }

        const shippingInfo = await getShippingRate(shippingAddress.postalCode, totalWeight);
        if (!shippingInfo) return res.status(400).json({ message: 'Shipping unavailable for this pincode.' });

        const finalTotalPrice = calculatedItemsPrice + shippingInfo.rate;

        const rzpOrder = await razorpay.orders.create({
            amount: Math.round(finalTotalPrice * 100),
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        const order = new Order({
            user: req.user!._id,
            orderItems,
            shippingAddress,
            paymentMethod: 'Razorpay',
            shippingPrice: shippingInfo.rate,
            totalPrice: finalTotalPrice,
            totalWeight: totalWeight,
            razorpayOrderId: rzpOrder.id,
            fromCart: fromCart || false
        });

        await order.save();
        res.status(201).json({ success: true, order, razorpayOrder: rzpOrder });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Verify Payment
export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.isPaid) return res.status(400).json({ message: 'Already paid' });

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        await finalizeOrderPayment(order, razorpay_payment_id, razorpay_signature);
        res.json({ success: true, message: 'Order confirmed', orderId: order._id });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const razorpayWebhook = async (req: Request, res: Response) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
        const signature = req.headers['x-razorpay-signature'] as string;
        const body = JSON.stringify(req.body);

        const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
        if (expectedSignature !== signature) return res.status(400).send('Invalid signature');

        const event = req.body.event;
        if (event === 'payment.captured' || event === 'order.paid') {
            const paymentDetails = req.body.payload.payment.entity;
            const order = await Order.findOne({ razorpayOrderId: paymentDetails.order_id });

            if (order && !order.isPaid) {
                await finalizeOrderPayment(order, paymentDetails.id, signature);
            }
        }
        res.status(200).send('ok');
    } catch (err: any) {
        res.status(500).send(err.message);
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status, courierPartner, trackingId } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (status === 'Shipped' && order.orderStatus !== 'Shipped' && order.isPaid) {
            const dtdcRes = await bookDTDCOrder(order);
            if (dtdcRes && dtdcRes.success) {
                order.trackingId = dtdcRes.reference_number;
                order.courierPartner = dtdcRes.courier_partner || 'DTDC Express';
                order.orderStatus = 'Shipped';
                order.shippedAt = new Date(); 
            } else {
                return res.status(400).json({ 
                    message: 'DTDC Booking Failed', 
                    error: (dtdcRes as any)?.message 
                });
            }
        } else {
            if (status === 'Shipped') order.shippedAt = new Date(); 
            order.orderStatus = status || order.orderStatus;
            if (courierPartner) order.courierPartner = courierPartner;
            if (trackingId) order.trackingId = trackingId;
        }

        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = new Date();
        }
        await order.save();
        res.json(order);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const getMyOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find({ user: req.user!._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const getOrderById = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error: any) { res.status(500).json({ message: error.message }); }
};