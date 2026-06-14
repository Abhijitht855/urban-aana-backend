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
import { sendOrderEmail } from '../utils/mail';

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

router.get('/test-mail', async (req, res) => {
  try {
    const dummyOrder = {
      _id: "6a26c40edc028040041bbf45",
      totalPrice: 1500,
      shippingAddress: { firstName: "TestUser", city: "Kochi", postalCode: "682001" },
      orderItems: [{ name: "Urban Oversized Tee", color: "Black", size: "L", quantity: 1, price: 1500 }]
    };

    await sendOrderEmail("abhijitht855@gmail.com", dummyOrder, 'CONFIRMED');

    res.json({ message: "Test email sent! Check your inbox." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;