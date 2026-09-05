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
- `VITE_ALLOW_MOCK`: `true` to enable offline demo data/auth (default `false`)
- `VITE_CLOUDINARY_CLOUD_NAME` / `VITE_CLOUDINARY_UPLOAD_PRESET`: enable admin image uploads

## 🔧 Backend

A full Express + Prisma (PostgreSQL) backend lives in `/backend` and implements every endpoint above. See `API_DOCS.md` for request/response shapes.

```bash
cd backend
cp .env.example .env      # set DATABASE_URL (Neon) + JWT_SECRET + ADMIN_PASSWORD
npx prisma migrate deploy # apply schema
npm run seed              # create admin + demo products + settings
npm run dev               # http://localhost:4000
```

The frontend uses the backend when reachable and falls back to mock/local data **only** when `VITE_ALLOW_MOCK=true`.

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

## 🔐 Auth

- **Production:** real JWT auth against the backend. Registration always creates `role: "user"`. The admin account is provisioned by the DB seed using `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars (see `backend/.env.example`).
- **Offline demo mode:** set `VITE_ALLOW_MOCK=true` in the frontend `.env` to enable mock data + mock login (any email, password ≥ 3 chars; `admin@hanout.dz` becomes admin). **Never enable this in production** — it is off by default.

## 🖼️ Images

Admin product image upload goes to **Cloudinary** (unsigned preset) when `VITE_CLOUDINARY_CLOUD_NAME` + `VITE_CLOUDINARY_UPLOAD_PRESET` are set. Without Cloudinary, uploads are disabled outside demo mode (paste an image URL instead). In demo mode it falls back to base64.

## 🗄️ Database

The backend uses **PostgreSQL** (Neon recommended). SQLite is no longer supported (the schema uses `Json` columns). See `DEPLOYMENT.md` for the full Vercel + Neon + Cloudinary setup.

## 💳 Payment

Currently COD (Cash on Delivery) for Algerian market. Ready to integrate:

- Stripe: Add `@stripe/stripe-js` and checkout session endpoint
- PayPal: Add `@paypal/react-paypal-js`
- Local gateway (Chargily, etc.): Add SDK and webhook handling

Place Payment component in `Cart.tsx` step 3.

## 🛠️ Production Checklist

- [x] Loading states & error handling
- [x] Form validation with messages (frontend + Zod on backend)
- [x] Image upload via Cloudinary (base64 only in demo mode)
- [x] Stock sync after checkout (server transaction)
- [x] Protected routes with redirect `state.from`
- [x] Notifications system (per-user scoped + admin broadcast)
- [x] Settings persistence (server-backed)
- [x] Wishlist with persistence
- [x] Order history per user
- [x] Category filtering via API
- [x] Accessibility (ARIA, focus, keyboard)
- [x] Responsive design (mobile sheets, desktop sidebars)
- [x] Toast notification system
- [x] Error boundary
- [x] Debounced search
- [x] Vite proxy + manual chunks
- [x] **Security:** helmet, CORS allow-list, rate limiting, JWT secret enforced, no email-based admin grant, mass-assignment-safe settings
- [x] **Real checkout API** (was local-only) + delivery pricing shared with backend
- [x] **PostgreSQL/Neon** with committed Prisma migration
- [x] `npm audit` clean (0 vulnerabilities, both apps)
- [ ] Unit tests (Vitest) — not yet added
- [ ] E2E tests (Playwright) — not yet added
- [ ] API documentation (Swagger) — see `API_DOCS.md` for now

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
