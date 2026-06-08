import express from 'express';
import { 
    checkServiceability, 
    getLiveTrackingHistory, 
    getShippingLabel
} from '../controllers/shipping.controller';
import { adminOnly, protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/check', checkServiceability);

router.get('/track/:trackingId', getLiveTrackingHistory);

router.get('/label/:referenceNumber', protect, adminOnly, getShippingLabel);

export default router;