import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { listNeighborhoods, getNeighborhoodStats } from '../controllers/neighborhoods.controller';

const router = Router();
router.use(authenticate as any);
router.get('/', listNeighborhoods);
router.get('/:id/stats/:month/:year', getNeighborhoodStats);
export default router;
