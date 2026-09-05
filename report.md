# HANOUT Template — Full Project Analysis Report

**Date:** 2026-09-05
**Repo:** https://github.com/haniboukeha/hanout-template.git (commit `05ac0c2`, 8 commits, main author: Boukeha Hani Abderraouf)
**Analyzed at:** `C:\Users\user\Documents\Default Project\hanout-template`

---

## ⚡ REMEDIATION UPDATE (same day)

All critical/high issues below have since been **fixed and verified** against a live PostgreSQL database:

- ✅ Prisma upgraded + schema moved to **PostgreSQL (Neon)** with a committed migration
- ✅ Admin-takeover via registration removed (register is always `role=user`; admin comes from seed via `ADMIN_EMAIL`/`ADMIN_PASSWORD`)
- ✅ Mock auth/data gated behind `VITE_ALLOW_MOCK` (default **off**)
- ✅ Checkout now calls the real backend API (transactional, server-side delivery pricing from `Setting` + zone logic)
- ✅ helmet, CORS allow-list (`CORS_ORIGINS`), rate limiting (auth: 20/15min, API: 300/min), JWT secret enforced in prod
- ✅ Zod validation on checkout/settings/notifications; settings mass-assignment fixed
- ✅ Notifications scoped per user (privacy leak fixed); status changes notify customers
- ✅ Cloudinary image upload for admin products (base64 only in demo mode)
- ✅ `npm audit`: **0 vulnerabilities** on both sides; ESLint: 0 errors; backend runs on **Vercel serverless** (`backend/api/index.ts`)
- ➕ Reusable verification: `backend/scripts/smoke-test.ps1` (9 checks, all passing)

See `DEPLOYMENT.md` for the Vercel + Neon + Cloudinary setup. The original analysis below is kept for the record.

---

## 1. Executive Summary

HANOUT is a full-stack e-commerce template targeting the Algerian market (DZD pricing, 58-wilaya delivery zones, COD payment). It consists of a React 19 + Vite 8 + Tailwind 4 + Zustand frontend and an Express 4 + Prisma + SQLite backend with JWT auth.

**Overall verdict:** A well-structured, visually complete demo template with a clever "backend-or-mock" fallback architecture — but **not production-ready**. It has a critical privilege-escalation flaw in auth, an incomplete frontend→backend checkout wiring, ~17 npm vulnerabilities, and the backend **does not build out-of-the-box** (Prisma schema incompatibility, fixed locally during setup — see §3).

| Area | Rating | Notes |
|---|---|---|
| Frontend structure | ★★★★☆ | Clean separation: pages/stores/components/hooks |
| Backend structure | ★★★☆☆ | Standard Express+Prisma, but validation gaps |
| Security | ★☆☆☆☆ | Admin takeover via registration, mock auth fallback |
| Data-layer design | ★★★★☆ | Elegant offline/mock fallback pattern |
| Completeness | ★★☆☆☆ | Checkout never hits backend; no tests |
| Repo hygiene | ★★☆☆☆ | Committed lint artifacts, broken Prisma config |

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2 | UI framework |
| Vite | 8.0 (rolldown) | Build tool; `/api` proxy → `localhost:4000`; manual chunks (vendor/ui/query) |
| TypeScript | 5.9 | Strict mode |
| Tailwind CSS | 4.2 | Styling (via `@tailwindcss/postcss`) |
| Zustand | 5.0 | State management with `persist` (localStorage) |
| React Router | 7.13 | Client routing |
| Framer Motion | 12.36 | Animations |
| lucide-react | 0.577 | Icons |
| @tanstack/react-query | 5.90 | **Installed & provider configured but never used** (0 `useQuery`/`useMutation` calls) — dead dependency |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Express | 4.18 | HTTP server |
| Prisma | 5.20 → **6.19 (upgraded during setup)** | ORM |
| SQLite | file `dev.db` | Database |
| bcrypt | 5.1 | Password hashing (cost 10) |
| jsonwebtoken | 9.0 | JWT auth, 7-day expiry |
| zod | 3.22 | Request validation (partial coverage) |
| tsx | 4.7 | Dev runner |

---

## 3. Setup Log (what was done & verified)

1. `npm install` (frontend) — 254 packages, **12 vulnerabilities** (1 low, 1 moderate, 10 high).
2. `npm install` (backend) — 197 packages, **5 vulnerabilities** (3 moderate, 1 high, 1 critical).
3. **BLOCKER found:** `npx prisma generate` failed with `P1012`: `images Json?` and `sizes Json?` in `schema.prisma` are unsupported by Prisma 5 + SQLite (SQLite JSON support landed in Prisma 6.5).
   - **Fix applied locally:** upgraded `prisma`/`@prisma/client` to `^6.8` (installed 6.19.3). No code changes needed. **This fix is not yet committed upstream.**
4. Created `backend/.env` from `.env.example`; `prisma db push` created `dev.db`; `npm run seed` created 2 users, 5 products, 1 settings row.
5. **Verification results:**
   - `npm run build` (frontend): **PASS** — tsc clean, bundle ≈ 622 kB raw / ≈ 184 kB gzipped.
   - Backend boot: **PASS** — `GET /api/health` → `{"success":true,...}`.
   - `GET /api/products` → 5 products.
   - `POST /api/auth/login` (`admin@hanout.dz` / `admin123`) → **PASS**, role `admin`, JWT issued.

**To run:** frontend `npm run dev` (port 5173), backend `cd backend && npm run dev` (port 4000). Frontend works standalone in mock mode without the backend.

---

## 4. Architecture

### 4.1 The dual-mode data layer (core design idea)

`src/lib/api.ts` wraps `fetch` and throws `NETWORK_ERROR` when the backend is unreachable. Every Zustand store follows the same pattern:

```
try backend → on NETWORK_ERROR → fall back to mock/local data (localStorage persistence)
```

This makes the template demo-able offline and production-ready in theory. In practice the fallback is **too permissive** (see security §6.1) and checkout bypasses the API entirely (§6.2).

### 4.2 Frontend structure (~8,900 LOC, 55 source files)

```
src/
  main.tsx          React 19 root: ErrorBoundary > QueryClientProvider > BrowserRouter
  App.tsx           Route table: public store, guest-only (login/signup),
                    auth-only (account/orders/notifications), admin-only (/admin/*)
  layouts/          RootLayout (74), AdminLayout (497 — sidebar+topbar admin shell)
  pages/store/      13 pages: Home, Shop, ProductDetail, Cart (305, 3-step checkout),
                    Login, SignUp, Account, Orders, Wishlist, About, Contact,
                    NotificationsPage, NotFound
  pages/admin/      6 pages: Dashboard, Products (CRUD+image upload), Orders
                    (status mgmt, invoice print), Customers (derived from orders),
                    Notifications (broadcast), Settings
  components/       common (Modal, Toast, Loading, ErrorBoundary, ProtectedRoute,
                    ConfirmDialog), layout (Navbar 341, AdminSidebar),
                    product (ProductCard, ProductQuickView)
  store/            8 Zustand stores, all persisted: auth, product, cart, order,
                    notification, settings, wishlist, toast
  lib/              api.ts (client), validators.ts (frontend mirror of Zod schemas)
  data/             algeria-provinces.ts (58 wilayas), algeria-communes.ts
  hooks/            useDebounce, useLocalStorage, useClickOutside
  utils/            cn (clsx+tailwind-merge), formatCurrency, delivery (pricing)
  mockData.ts       12 mock products
```

### 4.3 Backend structure (~750 LOC, 11 files)

```
backend/
  src/index.ts        Express app: CORS (localhost only), JSON body 10MB limit,
                      7 route mounts, 404 + error handlers
  src/lib/prisma.ts   Singleton PrismaClient
  src/middleware/auth.ts  authenticate (Bearer JWT), authorizeAdmin, signToken (7d)
  src/routes/
    auth.ts           register/login/me (Zod-validated, bcrypt)
    products.ts       list (filter/search/sort) + categories + CRUD (admin writes)
    cart.ts           add/update/remove + checkout ($transaction: order, items,
                      stock decrement, cart clear, notification)
    orders.ts         list (role-scoped), detail, PATCH status (admin)
    notifications.ts  list/create(admin)/read/read-all/clear(admin)
    settings.ts       get (auto-create), put (admin)
    delivery.ts       GET /price?wilaya=&method= (zone pricing)
  prisma/schema.prisma  7 models: User, Product, CartItem, Order, OrderItem,
                        Notification, Setting
  src/seed.ts         2 users, 5 products, settings
```

### 4.4 Domain logic

- **Delivery pricing** (both `src/utils/delivery.ts` and `backend/src/routes/delivery.ts`):
  - Algiers (16): Desk 300 DA / Home 500 DA
  - 22 far-south wilayas: Desk 800 / Home 1200
  - Rest: Desk 500 / Home 800
  - Free shipping over 20,000 DA
- **Auth roles:** `admin` | `user`; admin determined by email `admin@hanout.dz`.
- **Order lifecycle:** `Processing → Shipped → Delivered | Cancelled`.

---

## 5. Data Model

7 Prisma models, sensible relations (`CartItem @@unique([userId, productId, size])`, cascade deletes, `OrderItem` snapshots `price` at purchase). Notable gaps:

- `Order.userId` is optional — guest orders unlinkable.
- `Notification` has **no user scoping** — every authenticated user sees every notification (including other customers' order details in the message text — privacy leak).
- No `Wishlist` model — wishlist is localStorage-only, never syncs.
- No payment/shipping tracking fields (carrier, tracking number).
- `Setting` is a singleton row but `PUT /settings` passes `req.body` straight into Prisma (mass assignment — see §6.3).

---

## 6. Issues Found

### 6.1 CRITICAL — Security

1. **Admin takeover via public registration** — `backend/src/routes/auth.ts:30`:
   ```ts
   const isAdmin = email.toLowerCase() === 'admin@hanout.dz';
   ```
   Anyone can register with `admin@hanout.dz` (if unregistered) and instantly get the admin role. Seed creates this user, but on a fresh DB the first registrant wins admin. Role assignment must never be email-driven on a public endpoint.

2. **Mock login accepts any credentials** — `src/store/useAuthStore.ts:106-131`: when the backend errors *or* is unreachable, login falls through to "accept any email + password ≥ 3 chars", and `admin@hanout.dz` + any 3-char password unlocks the entire admin UI client-side. Combined with `ProtectedRoute` relying only on the locally stored `role`, the admin panel is trivially bypassable in mock mode. This is fine for a demo but silently dangerous if deployed as-is.

3. **JWT secret fallback hardcoded** — `backend/src/middleware/auth.ts:4`: if `JWT_SECRET` is unset, the server signs tokens with a known string committed to the repo → token forgery in production.

4. **17 npm vulnerabilities** (frontend 12, backend 5 incl. 1 critical `tar` path-traversal chain via `@mapbox/node-pre-gyp`, high `react-router-dom`, `brace-expansion`, `picomatch`, `postcss`, `vite`, `flatted` prototype pollution). Most are dev/build-time, but `react-router-dom` is runtime. `npm audit fix` resolves nearly all.

### 6.2 HIGH — Correctness / wiring

5. **Checkout never calls the backend** — `src/pages/store/Cart.tsx:95-96` only does `addOrder()` + `reduceStock()` in local Zustand stores. The well-written `POST /api/cart/checkout` transaction (with stock decrement + notification) is **dead code from the frontend's perspective**. Orders placed in the UI never reach the DB; backend cart routes are unused.

6. **Backend checkout pricing contradicts the documented rules** — `backend/src/routes/cart.ts:133`: `wilaya === '16' ? (Desk?300:500) : 500` — ignores far-south zones (800/1200) and Home delivery for non-Algiers, and hardcodes the 20,000 free-shipping threshold instead of reading `Setting`. The correct logic exists in `delivery.ts` but isn't reused.

7. **Prisma schema incompatible with pinned Prisma version** — `Json` fields + SQLite require Prisma ≥ 6.5; repo pins `^5.20`. Fresh clone → `prisma generate` fails (P1012). Fixed locally by upgrading to 6.19; **needs committing upstream** (or schema change to `String` + serialization).

8. **`mode: 'insensitive'` unsupported on SQLite** — `backend/src/routes/products.ts:32-34`: search is case-sensitive on SQLite (option is Postgres/MySQL-only).

9. **No migrations** — only `db push` works; `prisma migrate dev` has no migration history committed, and `DEPLOYMENT.md` instructs `migrate deploy` which would fail on a fresh clone.

### 6.3 MEDIUM — Hardening / consistency

10. **Mass assignment on settings** — `backend/src/routes/settings.ts:27`: `update({ data: req.body })` with no Zod whitelist.
11. **Unvalidated bodies** — checkout (`cart.ts:111`), notifications create (`notifications.ts:19`), order status (manual check only) skip Zod.
12. **No rate limiting, no helmet, no request logging** — acknowledged in DEPLOYMENT.md checklist but absent.
13. **CORS locked to `localhost:5173/3000`** — breaks any real deployment until edited.
14. **Tokens in `localStorage`** (`auth-storage`, `hanout_token`) — XSS-stealable; also duplicated under two keys.
15. **Notifications are global** — no per-user `userId` FK; `read-all` marks everyone's notifications read.
16. **README drift** — claims "12+ curated products" (seed has 5; mockData has 12); advertises "JWT-ready, role-based" auth without noting the mock bypass.
17. **Repo hygiene** — `lint_full.txt` / `lint_output.txt` (UTF-16 dumps referencing `C:\Users\user\Desktop\hanout`) committed; 4 known ESLint errors inside them (setState-in-effect ×2, `any` ×2).

### 6.4 LOW

18. `@tanstack/react-query` configured but unused — either adopt it for products/orders fetching or drop it.
19. Delivery pricing logic duplicated in 3 places (frontend util, backend route, backend checkout inline).
20. `deleteOrder` in `useOrderStore.ts:111-119` is local-only with commented-out API call; no `DELETE /api/orders` exists.
21. `express.json` limit of 10 MB exists to support base64 images from FileReader uploads — an image CDN (Cloudinary/UploadThing) is the better path (also noted in DEPLOYMENT.md).
22. `bcrypt` (native, deprecated `node-pre-gyp` chain) — consider `bcryptjs` or `argon2`.

---

## 7. Strengths

- **Genuinely nice offline-demo architecture**: the `NETWORK_ERROR` fallback keeps the whole storefront functional with zero backend.
- **Consistent Zustand store pattern**: loading/error states, `partialize` to persist only data slices, versioned storage keys.
- **Backend checkout is transactional**: order + items + stock decrement + cart clear + notification in one `$transaction` — correct concurrency thinking (even if the frontend doesn't call it yet).
- **Complete UX surface**: 19 pages including a full admin panel, toasts, skeletons, error boundary, confirm dialogs, protected/guest-only routes with `state.from` redirect, skip-link + ARIA accessibility touches.
- **Localized domain modeling**: wilaya zones, Desk/Home delivery, DZD, free-shipping threshold — a real differentiator for the Algerian COD market.
- **Good docs**: README, API_DOCS.md, DEPLOYMENT.md are thorough and mostly accurate.
- **Sensible bundle splitting** (vendor/ui/query chunks; ~184 kB gz total).

---

## 8. Prioritized Recommendations

| # | Action | Effort |
|---|---|---|
| 1 | Commit the Prisma 6 upgrade (or convert `Json` → `String` fields) so a fresh clone builds | Done locally — commit it |
| 2 | Remove email-based admin grant from `/register`; seed admin only, or require an invite/secret | S |
| 3 | Gate mock-mode auth behind an explicit `VITE_ALLOW_MOCK_AUTH=true` flag, default off | S |
| 4 | Wire `Cart.tsx` checkout to `api.checkout()` (keep local fallback only on NETWORK_ERROR) | M |
| 5 | Reuse `getDeliveryPrice()` + `Setting.freeShippingThreshold` inside backend checkout | S |
| 6 | `npm audit fix` in both packages; bump `react-router-dom` | S |
| 7 | Fail fast if `JWT_SECRET` is unset; add helmet + `express-rate-limit` on `/api/auth/*` | S |
| 8 | Add Zod schemas for checkout/settings/notifications bodies; whitelist settings updates | M |
| 9 | Scope notifications per user (`userId` FK) or make them admin-broadcast-only | M |
| 10 | Add initial Prisma migration; delete committed lint artifacts; fix the 4 ESLint errors | S |
| 11 | Adopt React Query for server data or remove the dependency | S |
| 12 | Add tests (Vitest for stores/validators, supertest for routes) — README already admits zero coverage | L |

---

## 9. How to Run

```bash
# Frontend (mock mode works standalone) — http://localhost:5173
npm install && npm run dev

# Backend — http://localhost:4000
cd backend
npm install
cp .env.example .env
npx prisma db push   # or: npx prisma migrate dev
npm run seed
npm run dev

# Demo accounts (backend mode)
# admin@hanout.dz / admin123   |   user@hanout.dz / user123
```

---

*Report generated by static analysis of all 66 source files plus runtime verification (build, boot, health, auth, and products smoke tests).*
