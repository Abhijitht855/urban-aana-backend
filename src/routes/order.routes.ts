import { Router } from 'express';
import { createOrder, getOrderById, getMyOrders } from '../controllers/order.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect); // എല്ലാ ഓർഡർ റൂട്ടുകൾക്കും ലോഗിൻ നിർബന്ധം

router.post('/', createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);

export default router;