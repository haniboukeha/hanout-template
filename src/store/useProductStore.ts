import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types';
import { MOCK_PRODUCTS } from '../mockData';

interface ProductState {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  reduceStock: (productId: string, quantity: number) => void;
  setProducts: (products: Product[]) => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: MOCK_PRODUCTS,
      addProduct: (newProduct) => {
        const productWithId = { ...newProduct, id: 'p-' + Math.random().toString(36).substr(2, 9) };
        set((state) => ({ products: [...state.products, productWithId] }));
      },
      updateProduct: (updatedProduct) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
        }));
      },
      deleteProduct: (productId) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        }));
      },
      reduceStock: (productId, quantity) => {
        set((state) => ({
          products: state.products.map((p) => 
            p.id === productId ? { ...p, stock: Math.max(0, p.stock - quantity) } : p
          ),
        }));
      },
      setProducts: (products) => set({ products }),
    }),
    {
      name: 'product-storage',
    }
  )
);
