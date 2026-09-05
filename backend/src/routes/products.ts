import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorizeAdmin, type AuthRequest } from '../middleware/auth.js';

const router = Router();

const productSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(10),
  price: z.number().positive(),
  imageUrl: z.string().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  category: z.string().min(1),
  stock: z.number().int().min(0),
  featured: z.boolean().optional(),
  sizes: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewsCount: z.number().int().min(0).optional(),
});

router.get('/', async (req, res) => {
  try {
    const { category, featured, search, sortBy } = req.query;

    const where: any = {};
    if (category && category !== 'All') where.category = category;
    if (featured === 'true') where.featured = true;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { category: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sortBy === 'price_asc') orderBy.price = 'asc';
    else if (sortBy === 'price_desc') orderBy.price = 'desc';
    else if (sortBy === 'rating') orderBy.rating = 'desc';
    else orderBy.createdAt = 'desc';

    const products = await prisma.product.findMany({ where, orderBy });

    res.json({ success: true, data: products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

router.get('/categories', async (_req, res) => {
  try {
    const categories = await prisma.product.findMany({
      distinct: ['category'],
      select: { category: true },
    });
    res.json({ success: true, data: categories.map((c) => c.category) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: String(req.params.id) } });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

router.post('/', authenticate, authorizeAdmin, async (req: AuthRequest, res) => {
  try {
    const data = productSchema.parse(req.body);
    const imageUrl = data.imageUrl || data.image || '';

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl,
        images: data.images || [],
        category: data.category,
        stock: data.stock,
        featured: data.featured || false,
        sizes: data.sizes || [],
        rating: data.rating || 5,
        reviewsCount: data.reviewsCount || 0,
      },
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
});

router.put('/:id', authenticate, authorizeAdmin, async (req: AuthRequest, res) => {
  try {
    const data = productSchema.partial().parse(req.body);

    const existing = await prisma.product.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });

    const updated = await prisma.product.update({
      where: { id: String(req.params.id) },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl || data.image,
        images: data.images,
        category: data.category,
        stock: data.stock,
        featured: data.featured,
        sizes: data.sizes,
        rating: data.rating,
        reviewsCount: data.reviewsCount,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

router.delete('/:id', authenticate, authorizeAdmin, async (req: AuthRequest, res) => {
  try {
    await prisma.product.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

export default router;
