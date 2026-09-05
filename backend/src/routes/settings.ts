import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

const settingsSchema = z.object({
  storeName: z.string().min(2).max(100).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(30).optional(),
  currency: z.string().min(1).max(10).optional(),
  timezone: z.string().max(50).optional(),
  freeShippingThreshold: z.number().min(0).optional(),
  defaultDeskPrice: z.number().min(0).optional(),
  defaultHomePrice: z.number().min(0).optional(),
  maintenanceMode: z.boolean().optional(),
  notificationsEmail: z.boolean().optional(),
  notificationsPush: z.boolean().optional(),
});

router.get('/', async (_req, res) => {
  try {
    let settings = await prisma.setting.findFirst();
    if (!settings) {
      settings = await prisma.setting.create({ data: {} });
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

router.put('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const data = settingsSchema.parse(req.body);
    const existing = await prisma.setting.findFirst();
    if (!existing) {
      const created = await prisma.setting.create({ data });
      return res.json({ success: true, data: created });
    }
    const updated = await prisma.setting.update({ where: { id: existing.id }, data });
    res.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

export default router;
