import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../index';

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { neighborhood: true },
    });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const totalTrees = await prisma.bill.aggregate({
      where: { userId: user.id, isConfirmed: true, treesSaved: { gt: 0 } },
      _sum: { treesSaved: true },
    });

    const now = new Date();
    const currentMonthCo2 = await prisma.bill.aggregate({
      where: { userId: user.id, isConfirmed: true, month: now.getMonth() + 1, year: now.getFullYear() },
      _sum: { co2Kg: true },
    });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      address: user.address,
      neighborhood: user.neighborhood,
      totalTreesSaved: totalTrees._sum.treesSaved ?? 0,
      currentMonthCo2Kg: currentMonthCo2._sum.co2Kg ?? 0,
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, avatarUrl, pushToken } = req.body;
    const trimmedName = typeof name === 'string' ? name.trim() : undefined;
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(trimmedName ? { name: trimmedName } : {}),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(pushToken !== undefined && { pushToken }),
      },
    });
    res.json({ id: updated.id, email: updated.email, name: updated.name, avatarUrl: updated.avatarUrl, address: updated.address });
  } catch (err) {
    console.error('updateMe error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getMyBills(req: AuthRequest, res: Response): Promise<void> {
  try {
    const bills = await prisma.bill.findMany({
      where: { userId: req.user!.id, isConfirmed: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    res.json(bills);
  } catch (err) {
    console.error('getMyBills error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
