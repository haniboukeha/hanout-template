/**
 * API client with fallback to local persistence
 * When VITE_API_URL is set and backend is reachable, uses fetch
 * Otherwise falls back to mock/local data
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
};

type ApiResponse<T> = {
  data: T;
  message?: string;
  success: boolean;
};

class ApiClient {
  private getAuthToken(): string | null {
    try {
      const auth = localStorage.getItem('auth-storage');
      if (!auth) return null;
      const parsed = JSON.parse(auth);
      return parsed.state?.token || parsed.state?.user?.token || null;
    } catch {
      return localStorage.getItem('hanout_token');
    }
  }

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', body, headers = {}, auth = true } = options;

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const finalHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (auth) {
      const token = this.getAuthToken();
      if (token) {
        finalHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const res = await fetch(url, {
        method,
        headers: finalHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      const contentType = res.headers.get('content-type');
      let data: any;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }

      if (!res.ok) {
        throw new Error(data?.message || data?.error || `Request failed: ${res.status}`);
      }

      // Normalize: if backend returns {data}, use it, else whole payload
      if (data && typeof data === 'object' && 'data' in data) {
        return data as ApiResponse<T>;
      }

      return {
        data: data as T,
        success: true,
      };
    } catch (err) {
      // Network error -> throw to allow fallback
      if (err instanceof Error && err.message.includes('Failed to fetch')) {
        throw new Error('NETWORK_ERROR');
      }
      throw err;
    }
  }

  // Products
  async getProducts(params?: Record<string, string | number | boolean>) {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return this.request<any[]>(`/products${query}`);
  }

  async getProduct(id: string) {
    return this.request<any>(`/products/${id}`);
  }

  async getCategories() {
    return this.request<string[]>(`/products/categories`);
  }

  async createProduct(payload: any) {
    return this.request<any>(`/products`, { method: 'POST', body: payload });
  }

  async updateProduct(id: string, payload: any) {
    return this.request<any>(`/products/${id}`, { method: 'PUT', body: payload });
  }

  async deleteProduct(id: string) {
    return this.request<void>(`/products/${id}`, { method: 'DELETE' });
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>(`/auth/login`, {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
  }

  async register(payload: { name: string; email: string; password: string }) {
    return this.request<{ user: any; token: string }>(`/auth/register`, {
      method: 'POST',
      body: payload,
      auth: false,
    });
  }

  async me() {
    return this.request<any>(`/auth/me`);
  }

  // Cart
  async getCart() {
    return this.request<any>(`/cart`);
  }

  async addToCart(productId: string, quantity: number, size?: string) {
    return this.request<any>(`/cart`, { method: 'POST', body: { productId, quantity, size } });
  }

  async updateCart(productId: string, quantity: number, size?: string) {
    return this.request<any>(`/cart/${productId}`, { method: 'PUT', body: { quantity, size } });
  }

  async removeFromCart(productId: string, size?: string) {
    const qs = size ? `?size=${encodeURIComponent(size)}` : '';
    return this.request<any>(`/cart/${productId}${qs}`, { method: 'DELETE' });
  }

  async checkout(payload: any) {
    return this.request<any>(`/cart/checkout`, { method: 'POST', body: payload });
  }

  // Orders
  async getOrders() {
    return this.request<any[]>(`/orders`);
  }

  async getOrder(id: string) {
    return this.request<any>(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request<any>(`/orders/${id}/status`, { method: 'PATCH', body: { status } });
  }

  // Notifications
  async getNotifications() {
    return this.request<any[]>(`/notifications`);
  }

  async markNotificationRead(id: string) {
    return this.request<any>(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  // Settings
  async getSettings() {
    return this.request<any>(`/settings`);
  }

  async updateSettings(payload: any) {
    return this.request<any>(`/settings`, { method: 'PUT', body: payload });
  }

  // Delivery
  async getDeliveryPrice(wilayaId: string, method: string) {
    return this.request<{ price: number }>(`/delivery/price?wilaya=${wilayaId}&method=${method}`);
  }
}

export const api = new ApiClient();

// Helper: is backend available?
export async function isBackendAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export type { ApiResponse };
