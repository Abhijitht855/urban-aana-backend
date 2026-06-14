import { Router } from 'express';
import { getBanners, createBanner, updateBanner, deleteBanner } from '../controllers/banner.controller';
import { adminOnly, protect } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getBanners);

router.post('/', protect, adminOnly, createBanner);
router.put('/:id', protect, adminOnly, updateBanner);
router.delete('/:id', protect, adminOnly, deleteBanner);

export default router;