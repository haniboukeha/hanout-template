# HANOUT - Premium E-Commerce Template

A modern, production-ready full-stack e-commerce solution built with React + Vite, TypeScript, Tailwind CSS, and Zustand. Designed for the Algerian market with 58 wilayas support, but adaptable globally.

## ✨ Features

### Storefront
- **Product Catalog**: 12+ curated products with categories, featured picks, new arrivals
- **Smart Filters**: Category, price range, search with debounce, sorting
- **Product Detail**: Gallery, size selection, stock indicators, related products
- **Cart**: Delivery price calculation by wilaya, desk vs home delivery, free shipping threshold
- **Wishlist**: Save favorites, bulk add to cart
- **User Account**: Profile management, order history, address book
- **Checkout**: Algeria communes data, phone validation, order creation
- **Notifications**: Real-time order updates
- **Responsive**: Mobile-first, fully accessible, optimized for performance

### Admin Panel
- **Dashboard**: Revenue (delivered orders), orders count, inventory value, low stock alerts
- **Products**: CRUD with image upload (FileReader + URL), gallery, sizes, featured flag
- **Orders**: Status management, invoice print, customer details, financial summary
- **Customers**: Auto-derived from orders, revenue per customer, status
- **Notifications**: Broadcast system, unread tracking
- **Settings**: Store config, shipping thresholds, localization, maintenance mode

### Technical
- **Auth**: JWT-ready structure, role-based (admin/user), protected routes, guest-only routes
- **API Layer**: `src/lib/api.ts` with backend fallback to mock data - works offline
- **Validation**: Frontend validators mirroring backend Zod schemas
- **State**: Zustand with persistence, loading/error states, optimistic updates
- **UI**: Toast system, loading skeletons, error boundaries, confirm dialogs
- **Delivery**: Wilaya-based pricing (Algiers 300/500 DA, South 800/1200 DA, North 500/800 DA)
- **Accessibility**: ARIA labels, focus rings, skip links, keyboard navigation

## 🚀 Quick Start

```bash
# Install deps
npm install

# Dev server (http://localhost:5173)
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

### Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

- `VITE_API_URL`: API base URL (default `/api` proxies to `http://localhost:4000`)
- `VITE_BACKEND_URL`: Backend URL for Vite proxy

## 🔧 Backend Integration

Frontend works without backend (mock mode), but is ready for real API.

Expected backend endpoints (see `src/lib/api.ts`):

```
GET    /api/health
GET    /api/products
GET    /api/products/categories
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id

POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me

GET    /api/cart
POST   /api/cart
PUT    /api/cart/:id
DELETE /api/cart/:id
POST   /api/cart/checkout

GET    /api/orders
GET    /api/orders/:id
PATCH  /api/orders/:id/status

GET    /api/notifications
PATCH  /api/notifications/:id/read

GET    /api/settings
PUT    /api/settings

GET    /api/delivery/price?wilaya=16&method=Desk
```

### Backend Scaffold (Express + Prisma + SQLite)

A minimal backend can be created as:

```
/hanout-back-end
  src/
    index.ts (Express app)
    routes/
    middleware/
    lib/prisma.ts
  prisma/
    schema.prisma
```

Schema example:

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  description String
  price       Float
  imageUrl    String
  images      Json?
  category    String
  stock       Int
  featured    Boolean @default(false)
  sizes       Json?
  rating      Float   @default(4.5)
  reviewsCount Int    @default(0)
  createdAt   DateTime @default(now())
}
```

Seeding: `npm run seed`

## 📦 Project Structure

```
src/
  components/
    common/   - Modal, Toast, Loading, ErrorBoundary, ProtectedRoute
    layout/   - Navbar, AdminSidebar
    product/  - ProductCard, ProductQuickView
  hooks/      - useDebounce, useLocalStorage, useClickOutside
  layouts/    - RootLayout, AdminLayout
  lib/        - api.ts, validators.ts
  pages/
    store/    - Home, Shop, Cart, ProductDetail, Account, Orders, Wishlist, About, Contact, Notifications, NotFound, Login, SignUp
    admin/    - Dashboard, Products, Orders, Customers, Notifications, Settings
  store/      - useAuthStore, useProductStore, useCartStore, useOrderStore, useNotificationStore, useSettingsStore, useWishlistStore, useToastStore
  data/       - algeria-provinces, algeria-communes
  utils/      - cn, formatCurrency, delivery
  mockData.ts
  types/
```

## 🔐 Auth Demo

- Admin: `admin@hanout.dz` / any password ≥3 chars (or `admin123` for demo)
- User: any valid email + password ≥3 chars
- In mock mode, any credentials work; with backend, validates against JWT

## 💳 Payment

Currently COD (Cash on Delivery) for Algerian market. Ready to integrate:

- Stripe: Add `@stripe/stripe-js` and checkout session endpoint
- PayPal: Add `@paypal/react-paypal-js`
- Local gateway (Chargily, etc.): Add SDK and webhook handling

Place Payment component in `Cart.tsx` step 3.

## 🛠️ Production Checklist

- [x] Loading states & error handling
- [x] Form validation with messages
- [x] Image upload via FileReader + URL fallback
- [x] Stock sync after checkout
- [x] Protected routes with redirect `state.from`
- [x] Notifications system (admin & user)
- [x] Settings persistence
- [x] Wishlist with persistence
- [x] Order history per user
- [x] Category filtering via API
- [x] Accessibility (ARIA, focus, keyboard)
- [x] Responsive design (mobile sheets, desktop sidebars)
- [x] Toast notification system
- [x] Error boundary
- [x] Debounced search
- [x] Vite proxy + manual chunks
- [ ] Unit tests (Vitest setup ready)
- [ ] E2E tests (Playwright)
- [ ] API documentation (Swagger)

## 📱 Mobile Considerations

- Bottom sheets for filters & notifications
- Sticky headers
- Touch-friendly buttons (min 44px)
- Swipe gestures in quick view

## 🌍 Deployment

### Vercel

`vercel.json` already configured. Set env vars in Vercel dashboard.

### Docker

```dockerfile
FROM node:20 as build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

## 📄 License

MIT - Free to use for personal and commercial projects.

## 🤝 Contributing

PRs welcome! Run `npm run lint` before committing.

---

Built with ♥ in Algiers. For issues, open a GitHub issue.
