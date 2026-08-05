import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorizeAdmin, type AuthRequest } from '../middleware/auth.js';

const router = Router();

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
    const where = req.user!.role === 'admin' ? { id: req.params.id } : { id: req.params.id, userId: req.user!.id };
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
    const { status } = req.body;
    const valid = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
});

export default router;
