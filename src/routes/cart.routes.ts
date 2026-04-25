import { Router } from 'express';
import {
    addToCart,
    getCart,
    removeFromCart,
    updateCartQuantity
} from '../controllers/cart.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// എല്ലാ കാർട്ട് റൂട്ടുകൾക്കും Auth പ്രൊട്ടക്ഷൻ നൽകുന്നു
router.use(protect);

router.post('/', addToCart);
router.get('/', getCart);
router.put('/:id', updateCartQuantity);
router.delete('/:id', removeFromCart);

export default router;