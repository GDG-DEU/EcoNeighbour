import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { individualLeaderboard, neighborhoodLeaderboard } from '../controllers/leaderboard.controller';

const router = Router();
router.use(authenticate as any);

/**
 * @swagger
 * tags:
 *   name: Leaderboard
 *   description: Liderlik tablosu sıralamaları
 */

/**
 * @swagger
 * /api/v1/leaderboard/individual/{month}/{year}:
 *   get:
 *     summary: Belirli ay/yıl için bireysel liderlik tablosunu getirir
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           example: 4
 *         description: Ay (1-12)
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2026
 *         description: Yıl
 *     responses:
 *       200:
 *         description: Bireysel sıralama listesi
 *       401:
 *         description: Yetkisiz erişim
 */
router.get('/individual/:month/:year', individualLeaderboard as any);

/**
 * @swagger
 * /api/v1/leaderboard/neighborhoods/{month}/{year}:
 *   get:
 *     summary: Belirli ay/yıl için mahalle liderlik tablosunu getirir
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           example: 4
 *         description: Ay (1-12)
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2026
 *         description: Yıl
 *     responses:
 *       200:
 *         description: Mahalle sıralama listesi
 *       401:
 *         description: Yetkisiz erişim
 */
router.get('/neighborhoods/:month/:year', neighborhoodLeaderboard as any);

export default router;
