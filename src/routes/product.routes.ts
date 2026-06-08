// import { Router } from 'express';
// import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from '../controllers/product.controller';
// import { adminOnly, protect } from '../middlewares/auth.middleware';
// import { upload } from '../config/cloudinary';

// const router = Router();

// router.get('/', getProducts);
// router.get('/:id', getProductById);

// // Admin-u mathram product create cheyyaanulla route
// // Multiple fields (mainImage and optional variant images) handle cheyyunnu
// router.post(
//     '/',
//     protect,
//     adminOnly,
//     upload.fields([
//         { name: 'mainImage', maxCount: 1 },
//         { name: 'variantImages', maxCount: 10 }
//     ]),
//     createProduct
// );

// router.put(
//     '/:id',
//     protect,
//     adminOnly,
//     upload.fields([
//         { name: 'mainImage', maxCount: 1 },
//         { name: 'variantImages', maxCount: 10 }
//     ]),
//     updateProduct
// );

// router.delete('/:id', protect, adminOnly, deleteProduct);

// export default router;

import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
  addVariant,
  updateVariant,
  deleteVariant,
  updateSize,
  addSize,
  globalSearch
} from '../controllers/product.controller';
import { adminOnly, protect } from '../middlewares/auth.middleware';

const router = Router();

// Public Routes
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/search/global', globalSearch);

// Admin Routes - Product Basic
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

// Admin Routes - Variant Management
router.post('/:id/variants', protect, adminOnly, addVariant);
router.put('/:id/variants/:variantId', protect, adminOnly, updateVariant);
router.delete('/:id/variants/:variantId', protect, adminOnly, deleteVariant);

// Admin Routes - Size Management
router.post('/:id/variants/:variantId/sizes', protect, adminOnly, addSize);
router.put('/:id/variants/:variantId/sizes/:sizeId', protect, adminOnly, updateSize);

export default router;