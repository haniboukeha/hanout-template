import type { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Minimalist Leather Watch',
    description: 'A timeless classic with a genuine leather strap and sapphire crystal glass. Features a Japanese quartz movement and a water-resistant stainless steel case.',
    price: 18900,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521446704128-662999990154?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Accessories',
    rating: 4.8,
    reviewsCount: 124,
    stock: 15,
    featured: true,
    createdAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'Noise Cancelling Headphones',
    description: 'Experience pure sound with industry-leading noise cancellation technology. Over-ear design with 40-hour battery life and quick charging capabilities.',
    price: 29900,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618366712277-7c0338a013ad?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Electronics',
    rating: 4.9,
    reviewsCount: 456,
    stock: 8,
    featured: true,
    createdAt: '2024-01-05T10:00:00Z',
  },
  {
    id: '3',
    name: 'Premium Cotton Hoodie',
    description: 'Handcrafted from 100% organic cotton for ultimate comfort and durability. Double-lined hood and reinforced stitching for a premium feel.',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Apparel',
    rating: 4.7,
    reviewsCount: 89,
    stock: 20,
    featured: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '4',
    name: 'Ergonomic Desk Chair',
    description: 'Designed for long hours of focus with adjustable lumbar support. Breathable mesh back and high-density foam seat for maximum productivity.',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1505843490701-5be550b23021?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1505843490701-5be550b23021?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Furniture',
    rating: 4.6,
    reviewsCount: 67,
    stock: 5,
    createdAt: '2023-12-15T10:00:00Z',
  },
  {
    id: '5',
    name: 'Canvas Sneakers',
    description: 'Versatile and lightweight sneakers for everyday wear. Vulcanized rubber sole and breathable canvas upper.',
    price: 5500,
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Apparel',
    rating: 4.5,
    reviewsCount: 156,
    stock: 30,
    sizes: ['40', '41', '42', '43', '44'],
    createdAt: '2023-11-25T10:00:00Z',
  }
];
