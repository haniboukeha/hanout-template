import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';
import { ALLOW_MOCK } from '../lib/env';

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
  fetchSettings: () => Promise<void>;
  saveSettings: (updates: Partial<StoreSettings>) => Promise<boolean>;
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

      fetchSettings: async () => {
        try {
          const res = await api.getSettings();
          if (res.data) {
            const s = res.data;
            set((state) => ({
              settings: {
                ...state.settings,
                storeName: s.storeName ?? state.settings.storeName,
                contactEmail: s.contactEmail ?? state.settings.contactEmail,
                contactPhone: s.contactPhone ?? state.settings.contactPhone,
                currency: s.currency ?? state.settings.currency,
                timezone: s.timezone ?? state.settings.timezone,
                freeShippingThreshold: s.freeShippingThreshold ?? state.settings.freeShippingThreshold,
                defaultDeskPrice: s.defaultDeskPrice ?? state.settings.defaultDeskPrice,
                defaultHomePrice: s.defaultHomePrice ?? state.settings.defaultHomePrice,
                maintenanceMode: s.maintenanceMode ?? state.settings.maintenanceMode,
                notificationsEmail: s.notificationsEmail ?? state.settings.notificationsEmail,
                notificationsPush: s.notificationsPush ?? state.settings.notificationsPush,
              },
            }));
          }
        } catch {
          // backend unavailable - keep persisted settings
        }
      },

      saveSettings: async (updates) => {
        set({ isLoading: true, error: null });
        try {
          try {
            await api.updateSettings(updates);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : '';
            if (!(msg === 'NETWORK_ERROR' && ALLOW_MOCK)) {
              set({ isLoading: false, error: msg || 'Failed to save settings' });
              return false;
            }
          }
          set((state) => ({
            settings: { ...state.settings, ...updates },
            isLoading: false,
          }));
          return true;
        } catch (err: any) {
          set({ isLoading: false, error: err?.message || 'Failed to save settings' });
          return false;
        }
      },

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
