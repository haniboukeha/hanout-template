import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types';
import { MOCK_PRODUCTS } from '../mockData';
import { api } from '../lib/api';

interface ProductState {
  products: Product[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string;

  // Actions
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  reduceStock: (productId: string, quantity: number) => void;
  setProducts: (products: Product[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Selectors
  getFeaturedProducts: () => Product[];
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
}

function normalizeBackendProduct(p: any): Product {
  // Backend may have imageUrl vs image
  return {
    id: p.id?.toString() || p._id || Math.random().toString(36).slice(2),
    name: p.name,
    description: p.description || '',
    price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
    image: p.image || p.imageUrl || p.thumbnail || '',
    images: p.images || (p.imageUrl ? [p.imageUrl] : p.image ? [p.image] : []),
    category: p.category || 'General',
    rating: p.rating ?? 4.5,
    reviewsCount: p.reviewsCount ?? p._count?.reviews ?? 0,
    stock: p.stock ?? 0,
    featured: p.featured ?? false,
    createdAt: p.createdAt || new Date().toISOString(),
    sizes: p.sizes || [],
  };
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: MOCK_PRODUCTS,
      categories: Array.from(new Set(MOCK_PRODUCTS.map((p) => p.category))),
      isLoading: false,
      error: null,
      searchQuery: '',
      selectedCategory: 'All',

      fetchProducts: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.getProducts();
          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            const normalized = (res.data as any[]).map(normalizeBackendProduct);
            set({
              products: normalized,
              categories: Array.from(new Set(normalized.map((p) => p.category))),
              isLoading: false,
            });
          } else {
            // backend empty or not returning expected shape, keep mock
            set({ isLoading: false });
          }
        } catch (err: any) {
          if (err?.message === 'NETWORK_ERROR') {
            // fallback silently to mock data
            set({ isLoading: false, error: null });
          } else {
            set({ isLoading: false, error: err?.message || 'Failed to fetch products' });
          }
        }
      },

      fetchCategories: async () => {
        try {
          const res = await api.getCategories();
          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            set({ categories: res.data as string[] });
          }
        } catch {
          // ignore, keep local categories
          const localCats = Array.from(new Set(get().products.map((p) => p.category)));
          set({ categories: localCats });
        }
      },

      addProduct: async (newProduct) => {
        set({ isLoading: true, error: null });
        try {
          try {
            const res = await api.createProduct({
              ...newProduct,
              imageUrl: newProduct.image,
            });
            const normalized = normalizeBackendProduct(res.data);
            set((state) => ({
              products: [...state.products, normalized],
              categories: Array.from(
                new Set([...state.categories, normalized.category])
              ),
              isLoading: false,
            }));
            return;
          } catch {
            // fallback to local
          }

          const productWithId: Product = {
            ...newProduct,
            id: 'p-' + Math.random().toString(36).substring(2, 9),
            createdAt: new Date().toISOString(),
            rating: newProduct.rating ?? 5,
            reviewsCount: newProduct.reviewsCount ?? 0,
          };
          set((state) => ({
            products: [...state.products, productWithId],
            categories: Array.from(
              new Set([...state.categories, productWithId.category])
            ),
            isLoading: false,
          }));
        } catch (err: any) {
          set({ error: err?.message || 'Failed to add product', isLoading: false });
          throw err;
        }
      },

      updateProduct: async (updatedProduct) => {
        set({ isLoading: true, error: null });
        try {
          try {
            const res = await api.updateProduct(updatedProduct.id, {
              ...updatedProduct,
              imageUrl: updatedProduct.image,
            });
            const normalized = normalizeBackendProduct(res.data);
            set((state) => ({
              products: state.products.map((p) =>
                p.id === normalized.id ? normalized : p
              ),
              isLoading: false,
            }));
            return;
          } catch {
            // fallback
          }

          set((state) => ({
            products: state.products.map((p) =>
              p.id === updatedProduct.id ? updatedProduct : p
            ),
            isLoading: false,
          }));
        } catch (err: any) {
          set({ error: err?.message || 'Failed to update product', isLoading: false });
          throw err;
        }
      },

      deleteProduct: async (productId) => {
        set({ isLoading: true, error: null });
        try {
          try {
            await api.deleteProduct(productId);
          } catch {
            // ignore network, still delete locally
          }
          set((state) => ({
            products: state.products.filter((p) => p.id !== productId),
            isLoading: false,
          }));
        } catch (err: any) {
          set({ error: err?.message || 'Failed to delete product', isLoading: false });
          throw err;
        }
      },

      reduceStock: (productId, quantity) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? { ...p, stock: Math.max(0, p.stock - quantity) }
              : p
          ),
        }));
      },

      setProducts: (products) =>
        set({
          products,
          categories: Array.from(new Set(products.map((p) => p.category))),
        }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      getFeaturedProducts: () => get().products.filter((p) => p.featured),
      getProductById: (id) => get().products.find((p) => p.id === id),
      getProductsByCategory: (category) =>
        get().products.filter((p) => p.category === category),
    }),
    {
      name: 'product-storage',
      version: 2,
      partialize: (state) => ({ products: state.products }),
    }
  )
);
