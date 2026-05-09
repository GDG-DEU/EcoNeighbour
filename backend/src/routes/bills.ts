import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadBill, confirmBill } from '../controllers/bills.controller';

const router = Router();
router.use(authenticate as any);

/**
 * @swagger
 * tags:
 *   name: Bills
 *   description: Fatura yükleme ve onaylama işlemleri
 */

/**
 * @swagger
 * /api/v1/bills/upload:
 *   post:
 *     summary: Fatura görüntüsü yükle (AI analizi için)
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Fatura fotoğrafı (jpg, png)
 *     responses:
 *       200:
 *         description: Fatura analiz edildi, sonuçlar döner (usage, co2Kg, type vb.)
 *       400:
 *         description: Dosya yüklenmedi veya analiz başarısız
 *       401:
 *         description: Yetkisiz erişim
 */
router.post('/upload', upload.single('image'), uploadBill as any);

/**
 * @swagger
 * /api/v1/bills/confirm:
 *   post:
 *     summary: AI analiz sonucunu onayla ve veritabanına kaydet
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, address, subscriberNumber, periodStart, periodEnd, usage, co2Kg, month, year]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [ELECTRICITY, GAS]
 *                 example: ELECTRICITY
 *               address:
 *                 type: string
 *                 example: Atatürk Cad. No:5 İstanbul
 *               subscriberNumber:
 *                 type: string
 *                 example: "123456789"
 *               periodStart:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-01"
 *               periodEnd:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-30"
 *               usage:
 *                 type: number
 *                 example: 250.5
 *               co2Kg:
 *                 type: number
 *                 example: 112.7
 *               month:
 *                 type: integer
 *                 example: 4
 *               year:
 *                 type: integer
 *                 example: 2026
 *               rawImageUrl:
 *                 type: string
 *                 example: "https://..."
 *     responses:
 *       201:
 *         description: Fatura başarıyla kaydedildi
 *       400:
 *         description: Bu ay için bu fatura tipi zaten mevcut
 *       401:
 *         description: Yetkisiz erişim
 */
router.post('/confirm', confirmBill as any);

export default router;
