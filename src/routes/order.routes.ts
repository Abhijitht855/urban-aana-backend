import { Router } from 'express';
import { 
    createOrder, 
    getOrderById, 
    getMyOrders, 
    updateOrderStatus,
    verifyPayment,
    getAllOrders,
    razorpayWebhook 
} from '../controllers/order.controller';
import { adminOnly, protect } from '../middlewares/auth.middleware';

const router = Router();

router.post('/webhook', razorpayWebhook);

// User Routes
router.post('/', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Admin Routes
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;