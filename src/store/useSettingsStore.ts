import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StoreSettings {
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  currency: string;
  timezone: string;
  freeShippingThreshold: number;
  defaultDeskPrice: number;
  defaultHomePrice: number;
  maintenanceMode: boolean;
  notificationsEmail: boolean;
  notificationsPush: boolean;
  logoUrl?: string;
}

interface SettingsState {
  settings: StoreSettings;
  isLoading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<StoreSettings>) => void;
  setSettings: (settings: StoreSettings) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetSettings: () => void;
}

const defaultSettings: StoreSettings = {
  storeName: 'HANOUT Premium Store',
  contactEmail: 'support@hanout.com',
  contactPhone: '+213 555 123 456',
  currency: 'DZD',
  timezone: 'Africa/Algiers',
  freeShippingThreshold: 20000,
  defaultDeskPrice: 500,
  defaultHomePrice: 800,
  maintenanceMode: false,
  notificationsEmail: true,
  notificationsPush: true,
  logoUrl: '/logo.png',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      isLoading: false,
      error: null,
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
      setSettings: (settings) => set({ settings }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'settings-storage',
      version: 1,
    }
  )
);
