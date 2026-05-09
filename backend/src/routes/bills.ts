import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadBill, confirmBill } from '../controllers/bills.controller';

const router = Router();
router.use(authenticate as any);
router.post('/upload', upload.single('image'), uploadBill as any);
router.post('/confirm', confirmBill as any);
export default router;
