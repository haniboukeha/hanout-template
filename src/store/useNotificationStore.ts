import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification } from '../types';
import { api } from '../lib/api';

interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  clearRead: () => void;
  getUnreadCount: () => number;
  getRecent: (count?: number) => Notification[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      isLoading: false,
      error: null,

      fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.getNotifications();
          if (res.data && Array.isArray(res.data)) {
            const normalized: Notification[] = (res.data as any[]).map((n: any) => ({
              id: n.id || n._id,
              title: n.title,
              message: n.message,
              type: n.type || 'info',
              read: n.read ?? false,
              createdAt: n.createdAt,
              orderId: n.orderId,
            }));
            set({ notifications: normalized, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (err: any) {
          if (err?.message === 'NETWORK_ERROR') {
            set({ isLoading: false });
          } else {
            set({ isLoading: false, error: err?.message || null });
          }
        }
      },

      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications].slice(0, 100), // keep last 100
        })),

      markAsRead: async (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
        try {
          await api.markNotificationRead(id);
        } catch {
          // ignore for mock mode
        }
      },

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      clearNotifications: () => set({ notifications: [] }),

      clearRead: () =>
        set((state) => ({
          notifications: state.notifications.filter((n) => !n.read),
        })),

      getUnreadCount: () => get().notifications.filter((n) => !n.read).length,

      getRecent: (count = 5) => get().notifications.slice(0, count),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'notification-storage',
      version: 2,
      partialize: (state) => ({ notifications: state.notifications }),
    }
  )
);
