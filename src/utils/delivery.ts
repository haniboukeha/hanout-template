export type DeliveryMethod = 'Desk' | 'Home';

export const getDeliveryPrice = (wilayaId: string, method: DeliveryMethod): number => {
  if (!wilayaId) return 0;
  
  // Categorize Wilayas
  const southFarWilayas = ['01', '08', '11', '30', '32', '33', '37', '38', '39', '40', '45', '47', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58'];
  const localWilaya = '16'; // Algiers

  if (method === 'Desk') {
    if (wilayaId === localWilaya) return 300;
    if (southFarWilayas.includes(wilayaId)) return 800;
    return 500; // Typical North/General
  } else {
    // Home delivery
    if (wilayaId === localWilaya) return 500;
    if (southFarWilayas.includes(wilayaId)) return 1200;
    return 800; // Typical North/General
  }
};
