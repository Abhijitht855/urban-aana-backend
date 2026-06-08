// import { Router } from 'express';
// import { register, login, getMe } from '../controllers/auth.controller';
// import { protect } from '../middlewares/auth.middleware';
// import { body } from 'express-validator';

// const router = Router();

// const registerValidation = [
//   body('name').trim().notEmpty().withMessage('Name is required'),
//   body('email').isEmail().withMessage('Valid email is required'),
//   body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
// ];

// const loginValidation = [
//   body('email').isEmail().withMessage('Valid email is required'),
//   body('password').notEmpty().withMessage('Password is required'),
// ];

// router.post('/register', registerValidation, register);
// router.post('/login', loginValidation, login);
// router.get('/me', protect, getMe);

// export default router;

import { Router } from 'express';
import { 
  register, 
  login, 
  getMe, 
  refresh, 
  logout, 
  getAllUsers,
  addAddress,
  setDefaultAddress,
  deleteAddress
} from '../controllers/auth.controller';
import { adminOnly, protect } from '../middlewares/auth.middleware';
import { body } from 'express-validator';

const router = Router();

// Validation middlewares
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh-token', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.get('/users', protect, adminOnly, getAllUsers); 

router.post('/addresses', protect, addAddress);
router.patch('/addresses/:addressId/default', protect, setDefaultAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

export default router;