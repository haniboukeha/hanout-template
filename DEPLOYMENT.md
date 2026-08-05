# Deployment Guide - HANOUT

## Frontend (Vercel / Netlify)

### Vercel (Recommended)

1. Connect GitHub repo `haniboukeha/hanout-template`
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output: `dist`
5. Env vars:
   - `VITE_API_URL` = `https://your-backend.com/api` or `/api` if same domain
   - `VITE_BACKEND_URL` = backend URL for proxy (optional)

`vercel.json` already present:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Netlify

- Build: `npm run build`
- Publish: `dist`
- Redirects: `/* /index.html 200`

## Backend (Railway / Render / Fly)

### Environment Variables

```
DATABASE_URL="file:./dev.db" # or postgres URL for prod
JWT_SECRET="change-me-strong-secret"
PORT=4000
NODE_ENV=production
```

### Build Steps

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

### SQLite vs Postgres

- Dev: SQLite file `prisma/dev.db`
- Prod: Switch to Postgres in `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
}
```

Then `DATABASE_URL` = `postgresql://user:pass@host:5432/db`

### Docker (Full Stack)

Frontend Dockerfile:

```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Backend Dockerfile:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
```

Docker Compose:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: "file:./dev.db"
      JWT_SECRET: "secret"
    volumes:
      - ./backend/prisma:/app/prisma
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

## CI/CD

GitHub Actions example `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## Monitoring

- Add Sentry for error tracking:
  ```bash
  npm install @sentry/react
  ```
- Add analytics: GA or Plausible

## Checklist Before Production

- [ ] Change `JWT_SECRET`
- [ ] Use Postgres for backend
- [ ] Enable HTTPS
- [ ] Set `VITE_API_URL` to prod backend
- [ ] Test auth flow
- [ ] Seed initial products
- [ ] Configure CORS for frontend domain
- [ ] Set up backups for DB
- [ ] Add rate limiting in backend (`express-rate-limit`)
- [ ] Add logging (`winston` or `pino`)

## Scaling

- Frontend is static, CDN-cached (Vercel Edge)
- Backend can scale horizontally, use Redis for sessions if needed
- SQLite not for horizontal scaling - migrate to Postgres
- Consider image CDN (Cloudinary, UploadThing) instead of FileReader base64

## Custom Domain

- Frontend: `hanout.dz`
- Backend: `api.hanout.dz`
- Configure DNS A/CNAME to hosting provider
- Issue SSL via Let's Encrypt or provider auto-SSL
