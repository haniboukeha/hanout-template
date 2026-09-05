import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorizeAdmin, type AuthRequest } from '../middleware/auth.js';

const router = Router();

const statusSchema = z.object({
  status: z.enum(['Processing', 'Shipped', 'Delivered', 'Cancelled']),
});

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const where = req.user!.role === 'admin' ? {} : { userId: req.user!.id };
    const orders = await prisma.order.findMany({
      where,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const where = req.user!.role === 'admin' ? { id: String(req.params.id) } : { id: String(req.params.id), userId: req.user!.id };
    const order = await prisma.order.findFirst({
      where,
      include: { items: { include: { product: true } } },
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
});

router.patch('/:id/status', authenticate, authorizeAdmin, async (req: AuthRequest, res) => {
  try {
    const { status } = statusSchema.parse(req.body);

    const existing = await prisma.order.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) return res.status(404).json({ success: false, message: 'Order not found' });

    const order = await prisma.order.update({
      where: { id: String(req.params.id) },
      data: { status },
    });

    if (existing.userId && existing.status !== status) {
      await prisma.notification.create({
        data: {
          userId: existing.userId,
          title: `Order ${status}`,
          message: `Your order ${order.id} is now ${status}`,
          type: status === 'Cancelled' ? 'error' : status === 'Delivered' ? 'success' : 'info',
          orderId: order.id,
        },
      });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
});

export default router;
