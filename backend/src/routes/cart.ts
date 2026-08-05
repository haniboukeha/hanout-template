import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = Router();

const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().default(1),
  size: z.string().optional(),
});

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user!.id },
      include: { product: true },
    });
    res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch cart' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { productId, quantity, size } = addToCartSchema.parse(req.body);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ success: false, message: `Only ${product.stock} units available` });

    const existing = await prisma.cartItem.findFirst({
      where: { userId: req.user!.id, productId, size: size || null } as any,
    });

    let item;
    if (existing) {
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: { product: true },
      });
    } else {
      item = await prisma.cartItem.create({
        data: {
          userId: req.user!.id,
          productId,
          quantity,
          size,
        },
        include: { product: true },
      });
    }

    res.json({ success: true, data: item });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add to cart' });
  }
});

router.put('/:productId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { quantity, size } = z.object({ quantity: z.number().int().min(0), size: z.string().optional() }).parse(req.body);

    if (quantity === 0) {
      await prisma.cartItem.deleteMany({
        where: { userId: req.user!.id, productId: req.params.productId, size: size || undefined } as any,
      });
      return res.json({ success: true, message: 'Item removed' });
    }

    const item = await prisma.cartItem.findFirst({
      where: { userId: req.user!.id, productId: req.params.productId, size: size || undefined } as any,
    });

    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });

    const updated = await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
      include: { product: true },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
});

router.delete('/:productId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { size } = req.query;
    await prisma.cartItem.deleteMany({
      where: { userId: req.user!.id, productId: req.params.productId, size: (size as string) || undefined } as any,
    });
    res.json({ success: true, message: 'Item removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to remove from cart' });
  }
});

router.post('/checkout', authenticate, async (req: AuthRequest, res) => {
  try {
    const { shippingAddress, phone, wilaya, city, deliveryMethod, customerName, email } = req.body;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user!.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    let total = 0;
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${item.product.name}` });
      }
      total += item.product.price * item.quantity;
    }

    // Simplified delivery price logic
    const deliveryPrice = wilaya === '16' ? (deliveryMethod === 'Desk' ? 300 : 500) : 500;
    const finalTotal = total > 20000 ? total : total + deliveryPrice;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: req.user!.id,
          customerName: customerName || req.user!.email,
          email: email || req.user!.email,
          phone: phone || '',
          shippingAddress: shippingAddress || `${city}, ${wilaya}`,
          total: finalTotal,
          status: 'Processing',
          deliveryMethod,
          wilaya,
          city,
        },
      });

      for (const cartItem of cartItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            size: cartItem.size,
            price: cartItem.product.price,
          },
        });

        await tx.product.update({
          where: { id: cartItem.productId },
          data: { stock: { decrement: cartItem.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId: req.user!.id } });

      await tx.notification.create({
        data: {
          title: 'New Order Received',
          message: `${customerName} placed order ${newOrder.id} for ${finalTotal} DA`,
          type: 'success',
          orderId: newOrder.id,
        },
      });

      return newOrder;
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Checkout failed' });
  }
});

export default router;
