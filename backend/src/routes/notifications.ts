import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { updatePushToken } from '../controllers/notifications.controller';

const router = Router();
router.use(authenticate as any);
router.patch('/push-token', updatePushToken as any);
export default router;
