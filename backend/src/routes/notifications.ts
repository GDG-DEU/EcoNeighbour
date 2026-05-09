import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { updatePushToken } from '../controllers/notifications.controller';

const router = Router();
router.use(authenticate as any);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Push bildirim token yönetimi
 */

/**
 * @swagger
 * /api/v1/notifications/push-token:
 *   patch:
 *     summary: Kullanıcının push notification token'ını güncelle
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pushToken]
 *             properties:
 *               pushToken:
 *                 type: string
 *                 example: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
 *     responses:
 *       200:
 *         description: Push token başarıyla güncellendi
 *       401:
 *         description: Yetkisiz erişim
 */
router.patch('/push-token', updatePushToken as any);

export default router;
