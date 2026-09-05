import { prisma } from './lib/prisma.js';
import bcrypt from 'bcrypt';

const MOCK_PRODUCTS = [
  {
    name: 'Minimalist Leather Watch',
    description: 'A timeless classic with genuine leather strap and sapphire crystal glass.',
    price: 18900,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521446704128-662999990154?q=80&w=800&auto=format&fit=crop',
    ],
    category: 'Accessories',
    rating: 4.8,
    reviewsCount: 124,
    stock: 15,
    featured: true,
    sizes: [],
  },
  {
    name: 'Noise Cancelling Headphones',
    description: 'Industry-leading noise cancellation with 40-hour battery life.',
    price: 29900,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
    category: 'Electronics',
    rating: 4.9,
    reviewsCount: 456,
    stock: 8,
    featured: true,
    sizes: [],
  },
  {
    name: 'Premium Cotton Hoodie',
    description: 'Handcrafted from 100% organic cotton.',
    price: 8500,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop',
    category: 'Apparel',
    rating: 4.7,
    reviewsCount: 89,
    stock: 20,
    featured: true,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    name: 'Ergonomic Desk Chair',
    description: 'Adjustable lumbar support and breathable mesh.',
    price: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1505843490701-5be550b23021?q=80&w=800&auto=format&fit=crop',
    category: 'Furniture',
    rating: 4.6,
    reviewsCount: 67,
    stock: 5,
    featured: false,
    sizes: [],
  },
  {
    name: 'Canvas Sneakers',
    description: 'Versatile lightweight sneakers for everyday wear.',
    price: 5500,
    imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop',
    category: 'Apparel',
    rating: 4.5,
    reviewsCount: 156,
    stock: 30,
    featured: false,
    sizes: ['40', '41', '42', '43'],
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();

  // Users
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@hanout.dz').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_PASSWORD) {
    throw new Error('FATAL: set ADMIN_PASSWORD before seeding in production');
  }
  if (adminPassword.length < 8) {
    console.warn('⚠️  WARNING: admin password is weak (<8 chars)');
  }

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const userPassword = await bcrypt.hash(process.env.DEMO_USER_PASSWORD || 'user123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: adminEmail,
      password: adminHash,
      role: 'admin',
    },
  });

  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'user@hanout.dz',
      password: userPassword,
      role: 'user',
      phone: '+213 555 123 456',
      address: 'Alger Centre, 16 Rue Didouche Mourad',
    },
  });

  console.log('👤 Users created:', admin.email, user.email);

  // Products
  for (const p of MOCK_PRODUCTS) {
    await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        images: p.images || [],
        category: p.category,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        stock: p.stock,
        featured: p.featured,
        sizes: p.sizes,
      },
    });
  }

  console.log(`📦 ${MOCK_PRODUCTS.length} products created`);

  // Settings
  await prisma.setting.create({
    data: {
      storeName: 'HANOUT Premium Store',
      contactEmail: 'support@hanout.com',
      contactPhone: '+213 555 123 456',
      currency: 'DZD',
      timezone: 'Africa/Algiers',
      freeShippingThreshold: 20000,
      defaultDeskPrice: 500,
      defaultHomePrice: 800,
    },
  });

  console.log('⚙️ Settings created');
  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
