import { Router } from 'express';
import { 
  createCategory, 
  getCategories, 
  deleteCategory 
} from '../controllers/category.controller';
import { adminOnly, protect } from '../middlewares/auth.middleware';

const router = Router();

// Public route: Ellaarkkum categories kaanaam
router.get('/', getCategories);

// Protected routes: Admin-u mathrame create/delete cheyyaan pattu
router.post('/', protect, adminOnly, createCategory);
router.delete('/:id',protect, adminOnly, deleteCategory);

export default router;