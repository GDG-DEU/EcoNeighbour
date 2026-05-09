import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { listNeighborhoods, getNeighborhoodStats } from '../controllers/neighborhoods.controller';

const router = Router();
router.use(authenticate as any);

/**
 * @swagger
 * tags:
 *   name: Neighborhoods
 *   description: Mahalle listeleme ve istatistik işlemleri
 */

/**
 * @swagger
 * /api/v1/neighborhoods:
 *   get:
 *     summary: Tüm mahalleleri listeler
 *     tags: [Neighborhoods]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mahalle listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   city:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *       401:
 *         description: Yetkisiz erişim
 */
router.get('/', listNeighborhoods);

/**
 * @swagger
 * /api/v1/neighborhoods/{id}/stats/{month}/{year}:
 *   get:
 *     summary: Belirli bir mahallenin aylık istatistiklerini getirir
 *     tags: [Neighborhoods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mahalle ID'si
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
 *         description: Mahalle istatistikleri (toplam co2, ağaç vb.)
 *       404:
 *         description: Mahalle bulunamadı
 *       401:
 *         description: Yetkisiz erişim
 */
router.get('/:id/stats/:month/:year', getNeighborhoodStats);

export default router;
