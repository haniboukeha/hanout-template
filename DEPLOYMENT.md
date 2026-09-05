# Deployment Guide - HANOUT (Vercel + Neon + Cloudinary)

Production stack:

| Piece | Service | Notes |
|---|---|---|
| Frontend | Vercel (project 1) | Static Vite SPA |
| Backend API | Vercel (project 2) | Express on serverless functions (`backend/api/index.ts`) |
| Database | Neon | PostgreSQL (serverless) |
| Images | Cloudinary | Unsigned upload preset from the browser |

---

## 1. Neon (database)

1. Create a project at https://console.neon.tech (Free plan is fine).
2. Copy the **pooled** connection string (the one containing `-pooler.` — required for serverless):
   ```
   postgresql://USER:PASS@HOST-pooler.REGION.aws.neon.tech/neondb?sslmode=require
   ```
3. Apply the schema + seed (run locally once, with the repo's `backend/` folder):
   ```bash
   cd backend
   echo 'DATABASE_URL="paste-pooled-url-here"' > .env
   echo 'JWT_SECRET="paste-a-long-random-secret"' >> .env
   echo 'NODE_ENV=production' >> .env
   echo 'ADMIN_PASSWORD="your-strong-admin-password"' >> .env
   npx prisma migrate deploy
   npm run seed
   ```

## 2. Backend on Vercel

1. Push this repo to GitHub.
2. Vercel → **New Project** → import the repo → set **Root Directory = `backend`**.
3. Environment variables (Settings → Environment Variables):

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | Neon **pooled** URL |
   | `JWT_SECRET` | `openssl rand -base64 48` output |
   | `NODE_ENV` | `production` |
   | `CORS_ORIGINS` | `https://your-frontend.vercel.app` (comma-separate multiple) |

4. Deploy. `vercel.json` runs `prisma generate && prisma migrate deploy && tsc` at build and routes everything to the Express app.
5. Verify: `https://your-backend.vercel.app/api/health`

> Note: the seed admin is created by the DB seed step (1), not by registration. Registration always creates `role=user`.

## 3. Cloudinary (images)

1. Create a free account at https://cloudinary.com.
2. Settings → **Upload** → **Upload presets** → add an **unsigned** preset named e.g. `hanout_uploads`.
   - Enable *Upload format: image*, set a folder (e.g. `hanout/products`), max size ~5MB.
3. Fill in the frontend env vars: `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`.

Admin → Products → image picker now uploads straight to Cloudinary and stores the returned `secure_url`. Without Cloudinary configured, file upload is disabled outside mock mode (URL paste still works).

## 4. Frontend on Vercel

1. Vercel → **New Project** → same repo → **Root Directory = `.` (repo root)**.
2. Environment variables:

   | Name | Value |
   |---|---|
   | `VITE_API_URL` | `https://your-backend.vercel.app/api` |
   | `VITE_CLOUDINARY_CLOUD_NAME` | your cloud name |
   | `VITE_CLOUDINARY_UPLOAD_PRESET` | `hanout_uploads` |
   | `VITE_ALLOW_MOCK` | **do not set** (must stay false in prod) |

3. Deploy. `vercel.json` already handles SPA rewrites.

## 5. Post-deploy checklist

- [ ] `GET https://api.../api/health` returns success
- [ ] Sign up a customer account → role is `user`
- [ ] Log in as seeded admin → `/admin` works
- [ ] Create a product with a Cloudinary image upload
- [ ] Place a test order → appears in admin Orders and in Neon (`prisma studio`)
- [ ] Change order status → customer notification appears
- [ ] Wrong password 5x → rate limit kicks in (429)
- [ ] `JWT_SECRET` is a long random value, not the example one

## 6. Local development

```bash
# Terminal 1 - backend (uses backend/.env; SQLite no longer supported)
cd backend && npm run dev        # needs a Postgres (Neon dev branch recommended)

# Terminal 2 - frontend
npm run dev                      # http://localhost:5173, /api proxied to :4000
```

Offline demo without any backend: set `VITE_ALLOW_MOCK=true` in the root `.env`.

## 7. Scaling notes

- Neon free tier: 190 compute hours/month — fine to start; watch cold starts.
- Prisma on serverless: always use the **pooled** Neon URL to avoid connection exhaustion.
- Move to a dedicated backend host (Railway/Fly) only if you need WebSockets/long jobs.
- Add Sentry (`@sentry/react` + backend) for error tracking when traffic grows.
