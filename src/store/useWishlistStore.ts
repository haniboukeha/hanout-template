import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types';

interface WishlistState {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  count: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addToWishlist: (product) => {
        const exists = get().items.find((p) => p.id === product.id);
        if (!exists) {
          set({ items: [...get().items, product] });
        }
      },
      removeFromWishlist: (productId) => {
        set({ items: get().items.filter((p) => p.id !== productId) });
      },
      isInWishlist: (productId) => {
        return get().items.some((p) => p.id === productId);
      },
      clearWishlist: () => set({ items: [] }),
      count: () => get().items.length,
    }),
    {
      name: 'wishlist-storage',
      version: 1,
    }
  )
);
