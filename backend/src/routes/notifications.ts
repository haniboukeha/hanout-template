import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorizeAdmin, type AuthRequest } from '../middleware/auth.js';

const router = Router();

const createSchema = z.object({
  title: z.string().min(2).max(200),
  message: z.string().min(1).max(1000),
  type: z.enum(['info', 'success', 'warning', 'error']).optional(),
  orderId: z.string().optional(),
  userId: z.string().optional(),
});

// Admin sees everything; users see their own notifications + broadcasts (userId null)
const visibilityWhere = (user: { id: string; role: string }) =>
  user.role === 'admin' ? {} : { OR: [{ userId: user.id }, { userId: null }] };

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: visibilityWhere(req.user!),
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ success: true, data: notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const data = createSchema.parse(req.body);
    const notification = await prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        orderId: data.orderId,
        userId: data.userId ?? null,
      },
    });
    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
});

router.patch('/read-all', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.notification.updateMany({
      where: { ...visibilityWhere(req.user!), read: false },
      data: { read: true },
    });
    res.json({ success: true, message: 'All marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed' });
  }
});

router.patch('/:id/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: { id: String(req.params.id), ...visibilityWhere(req.user!) },
      data: { read: true },
    });
    if (notification.count === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    const updated = await prisma.notification.findUnique({ where: { id: String(req.params.id) } });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
});

router.delete('/', authenticate, authorizeAdmin, async (_req, res) => {
  try {
    await prisma.notification.deleteMany({});
    res.json({ success: true, message: 'Cleared' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed' });
  }
});

export default router;
