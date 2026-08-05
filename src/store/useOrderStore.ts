import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderStatus } from '../types';
import { api } from '../lib/api';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;

  fetchOrders: () => Promise<void>;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  getOrdersByEmail: (email: string) => Order[];
  getOrderById: (id: string) => Order | undefined;
  getUserOrders: (email?: string) => Order[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [
        {
          id: 'ORD-7231',
          customerName: 'Alice Johnson',
          email: 'alice@example.com',
          shippingAddress: '123 Maple St, Springfield',
          phone: '+1 555-0101',
          items: [],
          total: 124.5,
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
          total: 89.0,
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
          total: 350.2,
          status: 'Shipped',
          createdAt: new Date(Date.now() - 43200000).toISOString(),
        },
      ],
      isLoading: false,
      error: null,

      fetchOrders: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.getOrders();
          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            // normalize if needed
            const normalized: Order[] = (res.data as any[]).map((o: any) => ({
              id: o.id || o._id,
              customerName: o.customerName || o.shippingName || o.user?.name || 'Customer',
              email: o.email || o.user?.email || '',
              shippingAddress: o.shippingAddress || o.address || '',
              phone: o.phone || '',
              items: o.items || [],
              total: o.total,
              status: o.status || 'Processing',
              createdAt: o.createdAt,
            }));
            set({ orders: normalized, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (err: any) {
          if (err?.message === 'NETWORK_ERROR') {
            set({ isLoading: false, error: null });
          } else {
            set({ isLoading: false, error: err?.message || 'Failed to fetch orders' });
          }
        }
      },

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),

      updateOrderStatus: async (id, status) => {
        // optimistic update
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        }));

        try {
          await api.updateOrderStatus(id, status);
        } catch {
          // keep optimistic for mock mode
        }
      },

      deleteOrder: async (id) => {
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== id),
        }));
        try {
          // if backend exists, delete
          // await api.deleteOrder(id);
        } catch {}
      },

      getOrdersByEmail: (email) => {
        if (!email) return [];
        return get().orders.filter(
          (o) => o.email.toLowerCase() === email.toLowerCase()
        );
      },

      getOrderById: (id) => get().orders.find((o) => o.id === id),

      getUserOrders: (email) => {
        if (!email) return get().orders;
        return get().orders.filter(
          (o) => o.email.toLowerCase() === email.toLowerCase()
        );
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'order-storage',
      version: 2,
      partialize: (state) => ({ orders: state.orders }),
    }
  )
);
