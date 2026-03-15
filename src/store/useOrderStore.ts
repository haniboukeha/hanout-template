import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderStatus } from '../types';

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [
        {
          id: 'ORD-7231',
          customerName: 'Alice Johnson',
          email: 'alice@example.com',
          shippingAddress: '123 Maple St, Springfield',
          phone: '+1 555-0101',
          items: [],
          total: 124.50,
          status: 'Delivered',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 'ORD-7230',
          customerName: 'Bob Smith',
          email: 'bob@example.com',
          shippingAddress: '456 Oak Ave, Metropolis',
          phone: '+1 555-0102',
          items: [],
          total: 89.00,
          status: 'Processing',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'ORD-7229',
          customerName: 'Charlie Brown',
          email: 'charlie@example.com',
          shippingAddress: '789 Pine Rd, Gotham',
          phone: '+1 555-0103',
          items: [],
          total: 350.20,
          status: 'Shipped',
          createdAt: new Date(Date.now() - 43200000).toISOString(),
        },
      ],
      addOrder: (order) => set((state) => ({ 
        orders: [order, ...state.orders] 
      })),
      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map((o) => o.id === id ? { ...o, status } : o)
      })),
      deleteOrder: (id) => set((state) => ({
        orders: state.orders.filter((o) => o.id !== id)
      })),
    }),
    {
      name: 'order-storage',
    }
  )
);
