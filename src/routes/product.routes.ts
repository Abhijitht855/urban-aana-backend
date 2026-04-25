import { Router } from 'express';
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from '../controllers/product.controller';
import { adminOnly, protect } from '../middlewares/auth.middleware';
import { upload } from '../config/cloudinary';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-u mathram product create cheyyaanulla route
// Multiple fields (mainImage and optional variant images) handle cheyyunnu
router.post(
    '/',
    protect,
    adminOnly,
    upload.fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'variantImages', maxCount: 10 }
    ]),
    createProduct
);

router.put(
    '/:id',
    protect,
    adminOnly,
    upload.fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'variantImages', maxCount: 10 }
    ]),
    updateProduct
);

router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;