import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../index';

export async function updatePushToken(req: AuthRequest, res: Response): Promise<void> {
  const { token } = req.body;
  if (!token) { res.status(400).json({ error: 'token is required' }); return; }
  await prisma.user.update({ where: { id: req.user!.id }, data: { pushToken: token } });
  res.json({ message: 'Push token updated' });
}
