import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

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
    const existing = await prisma.setting.findFirst();
    if (!existing) {
      const created = await prisma.setting.create({ data: req.body });
      return res.json({ success: true, data: created });
    }
    const updated = await prisma.setting.update({ where: { id: existing.id }, data: req.body });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

export default router;
