import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getMe, updateMe, getMyBills } from '../controllers/users.controller';

const router = Router();
router.use(authenticate as any);
router.get('/me', getMe as any);
router.patch('/me', updateMe as any);
router.get('/me/bills', getMyBills as any);
export default router;
