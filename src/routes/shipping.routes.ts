import express from 'express';
import { 
    checkServiceability, 
    getLiveTrackingHistory 
} from '../controllers/shipping.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * @route   POST /api/shipping/check
 * @desc    ചെക്കൗട്ട് പേജിൽ പിൻകോഡ് അടിക്കുമ്പോൾ റേറ്റ് കാണാൻ
 */
router.post('/check', protect, checkServiceability);

/**
 * @route   GET /api/shipping/track/:trackingId
 * @desc    യൂസർക്ക് തന്റെ ഓർഡർ എവിടെ എത്തിയെന്ന് ലൈവ് ആയി കാണാൻ
 */
router.get('/track/:trackingId', protect, getLiveTrackingHistory);

export default router;