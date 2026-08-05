import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (_req, res) => {
  try {
    const notifications = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    res.json({ success: true, data: notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { title, message, type, orderId } = req.body;
    const notification = await prisma.notification.create({
      data: { title, message, type: type || 'info', orderId },
    });
    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
});

router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json({ success: true, data: notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
});

router.patch('/read-all', authenticate, async (_req, res) => {
  try {
    await prisma.notification.updateMany({ data: { read: true } });
    res.json({ success: true, message: 'All marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed' });
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
