# Overview — ShopVN

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 19, React Router 7, Vite 7 |
| Backend | Node.js (ESM), Express 5 |
| Database | MongoDB + Mongoose (in-memory `mongodb-memory-server` khi dev) |
| Auth | JWT (`jsonwebtoken`), bcrypt |
| Payment | Stripe (mock mode nếu key là `sk_test_YOUR_KEY_HERE`) |
| i18n | react-i18next + i18next-browser-languagedetector |
| Upload | Multer (memory storage → base64 data URI) |
| Security | helmet, cors, express-rate-limit, express-mongo-sanitize |
| Testing | Playwright (E2E + API), TypeScript |

## Cấu trúc thư mục

```
SampleApp/
├── backend/
│   ├── app.js              # Express app setup
│   ├── config.js           # Env vars exports
│   ├── db.js               # MongoDB connect (auto in-memory nếu MONGODB_URI rỗng)
│   ├── seed.js             # Seed 3 users + 6 products khi khởi động
│   ├── controllers/        # Business logic
│   ├── middleware/         # auth, requireAdmin, upload, rateLimiter, checkAppKey
│   ├── models/             # Mongoose schemas: User, Product, Order, Cart
│   └── routes/             # Express routers: auth, products, orders, cart, users, profile
├── frontend/
│   ├── App.jsx             # Route map + CartProvider wrapper
│   ├── main.jsx            # React entry, i18n init
│   ├── api/                # Fetch wrappers cho từng domain
│   ├── components/         # LanguageSwitcher
│   ├── context/
│   │   └── CartContext.jsx # Cart state (localStorage + server sync)
│   ├── i18n/               # index.js, vi.json, en.json
│   └── pages/              # 10 pages
├── automation/
│   ├── playwright.config.ts
│   ├── global-setup.ts     # Warmup Vite trước khi test
│   ├── fixtures/           # Custom Playwright fixtures
│   ├── pages/              # Page Object Model classes
│   ├── tests/
│   │   ├── api/            # API tests (dùng Playwright request)
│   │   └── ui/             # UI tests (Playwright browser)
│   ├── api-services/       # Shared fetch wrapper cho API tests
│   └── data/               # Test data + mock responses
├── server.js               # Backend entry point
├── vite.config.js          # Vite + proxy config
├── .env.example            # Template env vars
└── .wiki/                  # LLM Wiki (file này)
```

## Environment Variables

### Root `.env` (copy từ `.env.example`)

| Biến | Giá trị mặc định | Ghi chú |
|------|-----------------|---------|
| `MONGODB_URI` | *(rỗng)* | Rỗng = dùng in-memory DB |
| `JWT_SECRET` | `shopvn-dev-jwt-secret` | Thay khi deploy |
| `APP_SECRET` | `shopvn-dev-app-secret` | Phải khớp `VITE_APP_SECRET` |
| `STRIPE_SECRET_KEY` | `sk_test_YOUR_KEY_HERE` | Mock mode nếu để default |
| `PORT` | `3001` | Backend port |
| `VITE_APP_SECRET` | `shopvn-dev-app-secret` | Phải khớp `APP_SECRET` |
| `NODE_ENV` | `test` | Bypass rate limiter (max 1000 thay vì 10) |

### `automation/.env`

| Biến | Giá trị |
|------|---------|
| `APP_SECRET` | `shopvn-dev-app-secret` | Dùng cho `X-App-Key` header trong API tests |

## Cách chạy

```bash
# Backend (port 3001)
NODE_ENV=test node server.js

# Frontend (port 5173)
npm run dev

# Tests
cd automation
npx playwright test --project=ui-chromium --project=api
```

## Quy ước chung

### Response format

**Success:**
```json
{ ...data }                          // trả thẳng object/array
{ "message": "OK" }                  // cho delete
{ "message": "OK", "deleted": 5 }   // cho bulk delete
```

**Error:**
```json
{ "errorCode": "SCREAMING_SNAKE_CASE", "message": "human readable" }
```

**Lỗi phổ biến:**

| HTTP | errorCode | Tình huống |
|------|-----------|-----------|
| 400 | `MISSING_FIELDS` | Thiếu / invalid field |
| 400 | `INVALID_ROLE` | Role không hợp lệ |
| 401 | `UNAUTHORIZED` | Không có / sai token |
| 403 | `FORBIDDEN` | Đúng token nhưng không đủ quyền |
| 403 | `FORBIDDEN_APP_KEY` | Thiếu / sai `X-App-Key` |
| 404 | `NOT_FOUND` | Resource không tồn tại |
| 409 | `USERNAME_EXISTS` | Trùng username |
| 413 | `FILE_TOO_LARGE` | Upload > 5MB |
| 429 | *(rate limit)* | Quá nhiều request |
| 500 | `INTERNAL_ERROR` | Server error |

### Auth headers

```
Authorization: Bearer <jwt_token>       # Cho tất cả API cần auth
X-App-Key: <APP_SECRET>                 # Chỉ cho /api/users/* (admin)
```

### Naming conventions

- **CSS classes**: `<page-prefix>-<element>` (e.g. `au-title`, `au-table` cho AdminUsers; `orders-toolbar`, `order-card` cho Orders)
- **data-testid**: dùng cho form inputs quan trọng (e.g. `add-user-name`, `add-user-username`)
- **i18n keys**: `<pageName>.<elementName>` (e.g. `orders.title`, `adminUsers.back`)
- **API error codes**: SCREAMING_SNAKE_CASE string
- **Controllers**: async functions, không có try/catch (Express 5 auto-catch async errors)
- **Backend ESM**: tất cả dùng `import/export`, không `require()`

### Seeded data (luôn có sau khi start server)

| Username | Password | Role |
|----------|----------|------|
| `admin` | `password123` | admin |
| `customer` | `password123` | customer |
| `testuser` | `password123` | customer |

6 sản phẩm mẫu: Cơm tấm, Phở, Bún bò, Bánh mì, Cà phê, Sinh tố.

### Vite Proxy

Tất cả request từ frontend đến `/api/*` được proxy sang `http://localhost:3001`:
```js
// vite.config.js
proxy: { '/api': { target: 'http://localhost:3001', ... } }
```

**Quan trọng cho Playwright**: Dùng `page.route((url: URL) => url.pathname === '/api/...', ...)` (không dùng full URL) để intercept Vite-proxied requests.
