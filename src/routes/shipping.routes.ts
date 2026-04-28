import express from 'express';
import { checkServiceability } from '../controllers/shipping.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// ലോഗിൻ ചെയ്ത യൂസർക്ക് പിൻകോഡ് അടിക്കുമ്പോൾ റേറ്റ് കാണാൻ
router.post('/check', protect, checkServiceability);

export default router;