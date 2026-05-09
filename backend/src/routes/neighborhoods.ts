import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { listNeighborhoods, getNeighborhoodStats } from '../controllers/neighborhoods.controller';

const router = Router();

// Public: needed during registration (user has no token yet)
router.get('/', listNeighborhoods);

// Protected: stats require authentication
router.get('/:id/stats/:month/:year', authenticate as any, getNeighborhoodStats as any);
export default router;
