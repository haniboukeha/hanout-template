import { Router } from 'express';

const router = Router();

const southFarWilayas = ['01', '08', '11', '30', '32', '33', '37', '38', '39', '40', '45', '47', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58'];
const localWilaya = '16';

export function getDeliveryPrice(wilayaId: string, method: string): number {
  if (!wilayaId) return 0;
  if (method === 'Desk') {
    if (wilayaId === localWilaya) return 300;
    if (southFarWilayas.includes(wilayaId)) return 800;
    return 500;
  } else {
    if (wilayaId === localWilaya) return 500;
    if (southFarWilayas.includes(wilayaId)) return 1200;
    return 800;
  }
}

router.get('/price', (req, res) => {
  const { wilaya, method } = req.query;
  const price = getDeliveryPrice(wilaya as string, (method as string) || 'Desk');
  res.json({ success: true, data: { price, wilaya, method } });
});

export default router;
