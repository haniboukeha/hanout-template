# HANOUT API Documentation

Base URL: `http://localhost:4000/api` (or proxied via `/api` in frontend)

## Authentication

### POST /api/auth/register

Register new user.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "John Doe", "email": "john@example.com", "role": "user" },
    "token": "jwt-token"
  }
}
```

### POST /api/auth/login

**Body:**
```json
{
  "email": "admin@hanout.dz",
  "password": "admin123"
}
```

**Response 200:** Same as register.

### GET /api/auth/me

Headers: `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": { "id": "...", "email": "...", "name": "...", "role": "admin" }
}
```

## Products

### GET /api/products

Query params:
- `category`: string
- `featured`: boolean (true)
- `search`: string
- `sortBy`: `price_asc` | `price_desc` | `rating`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Minimalist Leather Watch",
      "description": "...",
      "price": 18900,
      "imageUrl": "https://...",
      "images": [],
      "category": "Accessories",
      "stock": 15,
      "featured": true,
      "sizes": [],
      "rating": 4.8,
      "reviewsCount": 124,
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### GET /api/products/categories

**Response:**
```json
{ "success": true, "data": ["Apparel", "Electronics", "Accessories"] }
```

### GET /api/products/:id

### POST /api/products (Admin only)

Headers: `Authorization: Bearer <admin-token>`

**Body:**
```json
{
  "name": "New Product",
  "description": "At least 10 chars...",
  "price": 5000,
  "imageUrl": "https://...",
  "category": "Apparel",
  "stock": 10,
  "featured": false,
  "sizes": ["S", "M", "L"]
}
```

### PUT /api/products/:id (Admin)

### DELETE /api/products/:id (Admin)

## Cart

All cart routes require auth.

### GET /api/cart

**Response:**
```json
{
  "success": true,
  "data": [{ "id": "...", "productId": "1", "quantity": 2, "size": "M", "product": { "..." } }]
}
```

### POST /api/cart

**Body:**
```json
{ "productId": "1", "quantity": 1, "size": "M" }
```

### PUT /api/cart/:productId

**Body:**
```json
{ "quantity": 3, "size": "M" }
```

### DELETE /api/cart/:productId?size=M

### POST /api/cart/checkout

**Body:**
```json
{
  "customerName": "John Doe",
  "email": "john@example.com",
  "phone": "+213 555 123",
  "shippingAddress": "123 St, Alger",
  "wilaya": "16 - Alger",
  "city": "Alger Centre",
  "deliveryMethod": "Desk"
}
```

**Response 201:**
```json
{ "success": true, "data": { "id": "order-id", "total": 12000, "status": "Processing" } }
```

## Orders

### GET /api/orders (Admin sees all, user sees own)

### GET /api/orders/:id

### PATCH /api/orders/:id/status (Admin)

**Body:**
```json
{ "status": "Shipped" }
```

Valid statuses: `Processing`, `Shipped`, `Delivered`, `Cancelled`

## Notifications

### GET /api/notifications

### POST /api/notifications (Admin)

**Body:**
```json
{
  "title": "New Order",
  "message": "Order ORD-123 received",
  "type": "success",
  "orderId": "ORD-123"
}
```

### PATCH /api/notifications/:id/read

### PATCH /api/notifications/read-all

## Settings

### GET /api/settings

### PUT /api/settings (Admin)

**Body:**
```json
{
  "storeName": "HANOUT",
  "freeShippingThreshold": 20000,
  "defaultDeskPrice": 500,
  "maintenanceMode": false
}
```

## Delivery

### GET /api/delivery/price?wilaya=16&method=Desk

- `wilaya`: ID e.g., `16`
- `method`: `Desk` or `Home`

**Response:**
```json
{
  "success": true,
  "data": { "price": 300, "wilaya": "16", "method": "Desk" }
}
```

Pricing logic:
- Algiers (16): Desk 300 DA, Home 500 DA
- Far south (01,08,11,30,32,33,37-40,45,47,49-58): Desk 800 DA, Home 1200 DA
- Other: Desk 500 DA, Home 800 DA
- Free shipping over 20,000 DA (configurable)

## Health

### GET /api/health

**Response:**
```json
{ "success": true, "message": "HANOUT API is running", "timestamp": "..." }
```

## Error Format

```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // optional Zod errors
}
```

## Frontend Integration

Frontend `src/lib/api.ts` automatically:

1. Tries backend via `fetch('/api/...')` (proxied to `http://localhost:4000` in dev)
2. On `NETWORK_ERROR` (backend down), falls back to mock/local Zustand stores
3. Adds `Authorization: Bearer <token>` from `localStorage`

This allows frontend to work offline for demo, while being production-ready for real API.

## Swagger / OpenAPI

To add Swagger:

1. Install `swagger-ui-express` and `swagger-jsdoc` in backend
2. Create `swagger.ts` config
3. Mount at `/api-docs`

Example:

```ts
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(options)));
```
