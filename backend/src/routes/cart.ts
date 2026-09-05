import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { getDeliveryPrice } from './delivery.js';

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

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
        size: z.string().optional(),
      })
    )
    .min(1)
    .optional(),
  customerName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(6).max(20),
  address: z.string().min(5).max(300),
  wilaya: z.string().min(2).max(100),
  city: z.string().min(1).max(100),
  deliveryMethod: z.enum(['Desk', 'Home']),
});

router.post('/checkout', authenticate, async (req: AuthRequest, res) => {
  try {
    const parsed = checkoutSchema.parse(req.body);
    const { customerName, email, phone, address, wilaya, city, deliveryMethod } = parsed;

    let lineItems: { productId: string; quantity: number; size?: string }[];

    if (parsed.items && parsed.items.length > 0) {
      lineItems = parsed.items;
    } else {
      const cartItems = await prisma.cartItem.findMany({ where: { userId: req.user!.id } });
      lineItems = cartItems.map((c) => ({ productId: c.productId, quantity: c.quantity, size: c.size || undefined }));
    }

    if (lineItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: lineItems.map((i) => i.productId) } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    for (const item of lineItems) {
      const product = productMap.get(item.productId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product ${item.productId} no longer exists` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      subtotal += product.price * item.quantity;
    }

    const settings = await prisma.setting.findFirst();
    const freeThreshold = settings?.freeShippingThreshold ?? 20000;
    const wilayaId = wilaya.split(' - ')[0];
    const deliveryPrice = subtotal > freeThreshold ? 0 : getDeliveryPrice(wilayaId, deliveryMethod);
    const finalTotal = subtotal + deliveryPrice;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: req.user!.id,
          customerName,
          email,
          phone,
          shippingAddress: `${address}, ${city}, ${wilaya} (${deliveryMethod})`,
          total: finalTotal,
          status: 'Processing',
          deliveryMethod,
          wilaya,
          city,
        },
      });

      for (const item of lineItems) {
        const product = productMap.get(item.productId)!;
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            price: product.price,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId: req.user!.id } });

      await tx.notification.create({
        data: {
          userId: req.user!.id,
          title: 'Order Confirmed',
          message: `Your order ${newOrder.id} for ${finalTotal} DA has been received`,
          type: 'success',
          orderId: newOrder.id,
        },
      });

      return newOrder;
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Checkout failed' });
  }
});

export default router;
