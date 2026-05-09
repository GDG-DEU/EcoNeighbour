import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/auth.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Kimlik doğrulama işlemleri
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ali Yılmaz
 *               email:
 *                 type: string
 *                 example: ali@example.com
 *               password:
 *                 type: string
 *                 example: gizlisifre123
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz veri veya email zaten kayıtlı
 */
router.post('/register', register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Kullanıcı girişi (JWT token alır)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: ali@example.com
 *               password:
 *                 type: string
 *                 example: gizlisifre123
 *     responses:
 *       200:
 *         description: Giriş başarılı, access ve refresh token döner
 *       401:
 *         description: Geçersiz email veya şifre
 */
router.post('/login', login);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh token ile yeni access token al
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGci...
 *     responses:
 *       200:
 *         description: Yeni access token döner
 *       401:
 *         description: Geçersiz veya süresi dolmuş refresh token
 */
router.post('/refresh', refresh);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Kullanıcı çıkışı (refresh token iptal eder)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGci...
 *     responses:
 *       200:
 *         description: Başarıyla çıkış yapıldı
 */
router.post('/logout', logout);

export default router;
