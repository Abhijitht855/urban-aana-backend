import { Router } from 'express';
import { 
    createOrder, 
    getOrderById, 
    getMyOrders, 
    updateOrderStatus,
    verifyPayment,
    getAllOrders,
    razorpayWebhook, 
    syncOrderStatus
} from '../controllers/order.controller';
import { adminOnly, protect } from '../middlewares/auth.middleware';

const router = Router();


// User Routes
router.post('/', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Admin Routes
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.patch('/:id/sync-status', protect, adminOnly, syncOrderStatus);

export default router;