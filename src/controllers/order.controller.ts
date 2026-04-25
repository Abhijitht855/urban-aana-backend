import { Request, Response } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: Request, res: Response) => {
    try {
        const { 
            orderItems, 
            shippingAddress, 
            paymentMethod, 
            totalPrice 
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            res.status(400).json({ message: 'No order items' });
            return;
        }

        const order = new Order({
            user: req.user!._id,
            orderItems,
            shippingAddress: {
                address: shippingAddress.address,
                landmark: shippingAddress.landmark,
                city: shippingAddress.city,
                state: shippingAddress.state,
                postalCode: shippingAddress.postalCode,
                phone: shippingAddress.phone,
                altPhone: shippingAddress.altPhone
            },
            paymentMethod,
            totalPrice,
            // Default values model-il set cheythittundu (isPaid: false, status: 'Pending')
        });

        const createdOrder = await order.save();

        // Order kazhinjaal cart clear cheyyuka
        await Cart.deleteMany({ user: req.user!._id });

        res.status(201).json(createdOrder);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
export const getOrderById = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
            // Check if the order belongs to the logged-in user or if it's an admin
            if (order.user._id.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
                res.status(401).json({ message: 'Not authorized to view this order' });
                return;
            }
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
export const getMyOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find({ user: req.user!._id }).sort({ createdAt: -1 }); // Newest first
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};