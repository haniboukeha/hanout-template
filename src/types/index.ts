export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[]; // Multiple images for detailed view
  category: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  featured?: boolean;
  createdAt: string;
  sizes?: string[]; // e.g. ["M", "L", "XL"] or ["40", "41", "42"]
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  email: string;
  shippingAddress: string;
  phone: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  orderId?: string;
}

export interface AnalyticsData {
  sales: number;
  orders: number;
  averageOrderValue: number;
  recentOrders: Order[];
}
