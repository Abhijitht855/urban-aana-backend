import { Request, Response } from 'express';
import crypto from 'crypto';
import Order from '../models/Order';
import Product from '../models/Product';
import Cart from '../models/Cart';
import Razorpay from 'razorpay';
import { getShippingRate, bookDTDCOrder, getDTDCStatus } from './shipping.controller';
import User from '../models/User';
import mongoose from 'mongoose';
import { sendOrderEmail } from '../utils/mail';

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

    try {
        const user = await User.findById(order.user);
        if (user && user.email) {
            await sendOrderEmail(user.email, order, 'CONFIRMED');
        }
    } catch (mailError) {
        console.error("❌ Confirmation Email failed:", mailError);
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

        if (order.orderStatus === 'Cancelled') {
            return res.status(400).json({ message: 'Cancelled orders cannot be modified' });
        }

        if (status === 'Shipped' && !order.isPaid) {
            return res.status(400).json({ message: 'Cannot ship an unpaid order.' });
        }

        // --- A. SHIPPED STATUS LOGIC ---
        if (status === 'Shipped' && order.orderStatus !== 'Shipped') {
            const dtdcRes = await bookDTDCOrder(order);

            if (dtdcRes && dtdcRes.success) {
                order.trackingId = dtdcRes.reference_number;
                order.courierPartner = dtdcRes.courier_partner || 'DTDC Express';
                order.orderStatus = 'Shipped';
                order.shippedAt = new Date();

                const user = await User.findById(order.user);
                if (user && user.email) {
                    await sendOrderEmail(user.email, order, 'SHIPPED');
                }
            } else {
                return res.status(400).json({
                    message: 'DTDC Booking Failed',
                    error: (dtdcRes as any)?.message || 'Check DTDC connectivity'
                });
            }
        }
        // --- B. CANCELLED STATUS LOGIC ---
        else if (status === 'Cancelled') {
            if (order.isPaid) {
                for (const item of order.orderItems) {
                    await Product.updateOne(
                        { _id: item.product, "variants._id": item.variantId, "variants.sizes._id": item.sizeId },
                        { $inc: { "variants.$[v].sizes.$[s].stock": item.quantity } },
                        { arrayFilters: [{ "v._id": item.variantId }, { "s._id": item.sizeId }] }
                    );
                }
            }
            order.orderStatus = 'Cancelled';
        }
        // --- C. OTHER STATUS LOGIC ---
        else {
            if (status === 'Shipped' && !order.shippedAt) {
                order.shippedAt = new Date();
            }
            order.orderStatus = status || order.orderStatus;
            if (courierPartner) order.courierPartner = courierPartner;
            if (trackingId) order.trackingId = trackingId;
        }

        // --- D. DELIVERED STATUS LOGIC ---
        if (status === 'Delivered' && !order.isDelivered) {
            order.isDelivered = true;
            order.deliveredAt = new Date();
            order.orderStatus = 'Delivered';

            const user = await User.findById(order.user);
            if (user && user.email) {
                await sendOrderEmail(user.email, order, 'DELIVERED');
            }
        }

        await order.save();
        res.json(order);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const { search, startDate, endDate, status } = req.query;

        let query: any = {};

        if (search) {
            const searchStr = search as string;

            const users = await User.find({
                email: { $regex: searchStr, $options: 'i' }
            }).select('_id');
            const userIds = users.map(u => u._id);

            const orConditions: any[] = [
                { razorpayOrderId: { $regex: searchStr, $options: 'i' } },
                { user: { $in: userIds } }
            ];

            if (mongoose.isValidObjectId(searchStr)) {
                orConditions.push({ _id: searchStr });
            }

            query.$or = orConditions;
        }

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate as string),
                $lte: new Date(new Date(endDate as string).setHours(23, 59, 59, 999))
            };
        }

        if (status) {
            query.orderStatus = status;
        }

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find({
            user: req.user!._id,
            isPaid: true
        }).sort({ createdAt: -1 });

        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrderById = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const isOwner = order.user._id.toString() === req.user!._id.toString();
        const isAdmin = req.user?.role === 'admin';

        if (!isAdmin && !isOwner) {
            return res.status(401).json({ message: 'Not authorized to view this order' });
        }

        if (!isAdmin && !order.isPaid) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};


export const syncOrderStatus = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (!order.trackingId) {
            return res.status(400).json({ success: false, message: 'Order does not have a tracking ID' });
        }

        const rawStatus = await getDTDCStatus(order.trackingId);

        if (!rawStatus) {
            return res.status(400).json({ success: false, message: 'Could not fetch status from DTDC' });
        }

        const status = rawStatus.toLowerCase().trim().replace(/\.$/, '')

        const DELIVERED_STATUSES = ['delivered', 'dlvd', 'delivery done', 'shipment delivered', 'successfully delivered', 'recipient received'];
        const CANCELLED_STATUSES = ['cancelled', 'pickup cancelled', 'return as per client instruction', 'pcan', 'stopdlv'];

        let updated = false;

        if (DELIVERED_STATUSES.includes(status) && order.orderStatus !== 'Delivered') {
            order.orderStatus = 'Delivered';
            order.isDelivered = true;
            order.deliveredAt = new Date();
            updated = true;
        }
        else if (CANCELLED_STATUSES.includes(status) && order.orderStatus !== 'Cancelled') {
            order.orderStatus = 'Cancelled';
            updated = true;
        }

        if (updated) {
            await order.save();
            return res.json({
                success: true,
                message: `Order status synced to: ${order.orderStatus}`,
                currentDTDCStatus: rawStatus
            });
        }

        res.json({
            success: true,
            message: 'Order status is already up to date',
            currentDTDCStatus: rawStatus
        });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};