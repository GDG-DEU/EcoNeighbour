import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getMe, updateMe, getMyBills } from '../controllers/users.controller';

const router = Router();
router.use(authenticate as any);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Kullanıcı profil işlemleri
 */

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Giriş yapmış kullanıcının profilini getirir
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı profil bilgileri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 avatarUrl:
 *                   type: string
 *                   nullable: true
 *                 neighborhoodId:
 *                   type: string
 *                   nullable: true
 *       401:
 *         description: Yetkisiz erişim
 */
router.get('/me', getMe as any);

/**
 * @swagger
 * /api/v1/users/me:
 *   patch:
 *     summary: Kullanıcı profilini güncelle
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Yeni İsim
 *               avatarUrl:
 *                 type: string
 *                 example: https://example.com/avatar.png
 *               neighborhoodId:
 *                 type: string
 *                 example: clx1234abc
 *               pushToken:
 *                 type: string
 *                 example: ExponentPushToken[xxx]
 *     responses:
 *       200:
 *         description: Profil başarıyla güncellendi
 *       401:
 *         description: Yetkisiz erişim
 */
router.patch('/me', updateMe as any);

/**
 * @swagger
 * /api/v1/users/me/bills:
 *   get:
 *     summary: Kullanıcının yüklediği tüm faturaları listeler
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fatura listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [ELECTRICITY, GAS]
 *                   usage:
 *                     type: number
 *                   co2Kg:
 *                     type: number
 *                   month:
 *                     type: integer
 *                   year:
 *                     type: integer
 *       401:
 *         description: Yetkisiz erişim
 */
router.get('/me/bills', getMyBills as any);

export default router;
