// import { Router } from 'express';
// import { 
//     createOrder, 
//     getOrderById, 
//     getMyOrders, 
//     updateOrderStatus,
//     verifyPayment 
// } from '../controllers/order.controller';
// import { protect } from '../middlewares/auth.middleware';

// const router = Router();

// router.use(protect);

// router.post('/', createOrder);
// router.post('/verify', verifyPayment); // പേയ്‌മെന്റ് വെരിഫൈ ചെയ്യാൻ
// router.get('/myorders', getMyOrders);
// router.get('/:id', getOrderById);
// router.put('/:id/status', updateOrderStatus); // Admin only (Add admin middleware if needed)

// export default router;

// import { Router } from 'express';
// import { 
//     createOrder, 
//     getOrderById, 
//     getMyOrders, 
//     updateOrderStatus,
//     verifyPayment,
//     getAllOrders 
// } from '../controllers/order.controller';
// import { adminOnly, protect } from '../middlewares/auth.middleware';

// const router = Router();

// router.use(protect);

// // ─── കസ്റ്റമർ റൂട്ടുകൾ ────────────────────────────────

// router.post('/', createOrder);
// router.post('/verify', verifyPayment);
// router.get('/myorders', getMyOrders); // ഇത് /:id എന്നതിന് മുൻപ് വരണം (നിർബന്ധം)

// // ─── അഡ്മിൻ റൂട്ടുകൾ ─────────────────────────────────

// // എല്ലാ ഓർഡറുകളും കാണാൻ (GET /api/orders)
// router.get('/', adminOnly, getAllOrders); 

// // സ്റ്റാറ്റസ് മാറ്റാൻ
// router.put('/:id/status', adminOnly, updateOrderStatus);

// // ─── ഐഡി വെച്ചുള്ള റൂട്ടുകൾ (അവസാനം വരുന്നത് നല്ലത്) ────────

// router.get('/:id', getOrderById);

// export default router;

import { Router } from 'express';
import { 
    createOrder, 
    getOrderById, 
    getMyOrders, 
    updateOrderStatus,
    verifyPayment,
    getAllOrders,
    razorpayWebhook // പുതിയത്
} from '../controllers/order.controller';
import { adminOnly, protect } from '../middlewares/auth.middleware';

const router = Router();

// 🔥 Webhook റൂട്ടിന് protect വേണ്ട (Razorpay ആണ് ഇത് വിളിക്കുന്നത്)
router.post('/webhook', razorpayWebhook);

// User Routes
router.post('/', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Admin Routes
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;