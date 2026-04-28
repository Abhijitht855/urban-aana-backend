import { Router } from 'express';
import { 
    createOrder, 
    getOrderById, 
    getMyOrders, 
    updateOrderStatus,
    verifyPayment 
} from '../controllers/order.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.post('/', createOrder);
router.post('/verify', verifyPayment); // പേയ്‌മെന്റ് വെരിഫൈ ചെയ്യാൻ
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus); // Admin only (Add admin middleware if needed)

export default router;