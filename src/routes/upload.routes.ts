import { Router } from 'express';
import { uploadFiles } from '../controllers/upload.controller';
import { protect, adminOnly } from '../middlewares/auth.middleware';
import { upload } from '../config/cloudinary';

const router = Router();

router.post(
  '/',
  protect,
  adminOnly,
  upload.array('files', 10),
  uploadFiles
);

export default router;