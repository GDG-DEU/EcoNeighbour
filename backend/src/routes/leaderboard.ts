import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { individualLeaderboard, neighborhoodLeaderboard } from '../controllers/leaderboard.controller';

const router = Router();
router.use(authenticate as any);
router.get('/individual/:month/:year', individualLeaderboard as any);
router.get('/neighborhoods/:month/:year', neighborhoodLeaderboard as any);
export default router;
