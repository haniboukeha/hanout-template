import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types';
import { useProductStore } from './useProductStore';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;

  addItem: (product: Product, size?: string) => { success: boolean; message?: string };
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => { success: boolean; message?: string };
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  getShippingEstimate: () => { subtotal: number; items: number };
  checkStockAvailability: (productId: string, requestedQuantity: number) => { available: boolean; stock: number };
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      checkStockAvailability: (productId, requestedQuantity) => {
        const productStore = useProductStore.getState();
        const product = productStore.products.find((p) => p.id === productId);
        if (!product) {
          return { available: false, stock: 0 };
        }
        return {
          available: product.stock >= requestedQuantity,
          stock: product.stock,
        };
      },

      addItem: (product, size) => {
        const items = get().items;
        const existingItem = items.find(
          (item) => item.id === product.id && item.selectedSize === size
        );

        const currentQuantity = existingItem ? existingItem.quantity : 0;
        const requestedTotal = currentQuantity + 1;

        // Check stock (allow adding but warn if exceeds)
        const stockCheck = get().checkStockAvailability(product.id, requestedTotal);
        if (!stockCheck.available) {
          if (stockCheck.stock <= 0) {
            return {
              success: false,
              message: `Sorry, ${product.name} is out of stock`,
            };
          }
          if (currentQuantity >= stockCheck.stock) {
            return {
              success: false,
              message: `Only ${stockCheck.stock} units available for ${product.name}`,
            };
          }
        }

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === product.id && item.selectedSize === size
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
            error: null,
          });
        } else {
          set({
            items: [...items, { ...product, quantity: 1, selectedSize: size }],
            error: null,
          });
        }

        return { success: true };
      },

      removeItem: (productId, size) => {
        set({
          items: get().items.filter(
            (item) => !(item.id === productId && item.selectedSize === size)
          ),
        });
      },

      updateQuantity: (productId, quantity, size) => {
        if (quantity <= 0) {
          get().removeItem(productId, size);
          return { success: true };
        }

        const stockCheck = get().checkStockAvailability(productId, quantity);
        if (!stockCheck.available) {
          return {
            success: false,
            message: `Only ${stockCheck.stock} units available`,
          };
        }

        set({
          items: get().items.map((item) =>
            item.id === productId && item.selectedSize === size
              ? { ...item, quantity }
              : item
          ),
        });

        return { success: true };
      },

      clearCart: () => set({ items: [], error: null }),

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      getShippingEstimate: () => {
        return {
          subtotal: get().getTotal(),
          items: get().getItemCount(),
        };
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'cart-storage',
      version: 2,
      partialize: (state) => ({ items: state.items }),
    }
  )
);
