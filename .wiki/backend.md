# Backend — ShopVN

> Xem thêm: [overview.md](./overview.md) cho env vars, error codes, auth headers

## Middleware Chain

```
Request → helmet → cors → express.json → sanitize → [route middlewares] → controller → error handler
```

**Middleware files:**

| File | Mục đích |
|------|---------|
| `middleware/auth.js` | `requireAuth`: Verify JWT Bearer token, gán `req.user = {id, username, role}` |
| `middleware/requireAdmin.js` | `requireAdmin`: 403 nếu `req.user.role !== 'admin'` |
| `middleware/checkAppKey.js` | `checkAppKey`: 403 nếu `req.headers['x-app-key'] !== APP_SECRET` |
| `middleware/upload.js` | `upload.single('avatar')`: Multer memory, max 5MB, image only. `handleUploadError`: trả 400/413 |
| `middleware/rateLimiter.js` | `loginLimiter`: 10 req/15min; `registerLimiter`: 10 req/60min. `NODE_ENV=test` → max=1000 |

## API Routes

### Auth — `/api/auth`
*(No X-App-Key needed)*

| Method | Path | Middleware | Body/Query | Response |
|--------|------|-----------|-----------|---------|
| `POST` | `/login` | loginLimiter | `{username, password}` JSON | `{token, user: {id, username, name, role, avatar}}` |
| `POST` | `/register` | registerLimiter, upload.single('avatar') | multipart: `username, password, name, avatar?` | `{token, user: {...}}` |
| `GET` | `/me` | requireAuth | — | `{id, username, name, role, avatar}` |

### Products — `/api/products`
*(requireAuth)*

| Method | Path | Middleware | Body/Query | Response |
|--------|------|-----------|-----------|---------|
| `GET` | `/` | requireAuth | `?category=&tag=` | `[{_id, name, price, emoji, tag, category, stock}]` |
| `GET` | `/:id` | requireAuth | — | `{...product}` |
| `POST` | `/` | requireAuth, requireAdmin | `{name, price, emoji, tag, category, stock}` | `{...product}` 201 |
| `DELETE` | `/:id` | requireAuth, requireAdmin | — | `{message: 'OK'}` |

### Orders — `/api/orders`
*(requireAuth)*

| Method | Path | Body/Query | Response |
|--------|------|-----------|---------|
| `POST` | `/payment-intent` | `{amount}` | `{clientSecret}` (mock hoặc Stripe) |
| `POST` | `/` | `{items, recipientName, recipientPhone, address, paymentMethod, paymentIntentId?, totalPrice}` | order object 201 |
| `GET` | `/` | `?page=1&limit=10&search=&status=&paymentMethod=` | `{orders: [...], pagination: {page, limit, total, totalPages}}` |
| `DELETE` | `/` | `?search=&status=&paymentMethod=` | `{message: 'OK', deleted: N}` — xoá theo filter hiện tại |
| `DELETE` | `/:id` | — | `{message: 'OK'}` |

**Order object:**
```json
{
  "_id": "...", "id": "...",
  "userId": "...",
  "items": [{"productId": "...", "name": "Phở", "price": 45000, "quantity": 2, "emoji": "🍜"}],
  "recipientName": "Nguyễn Văn A",
  "recipientPhone": "0901234567",
  "address": "123 Lê Lợi, Q1",
  "paymentMethod": "cash" | "card",
  "paymentIntentId": null | "pi_...",
  "totalPrice": 90000,
  "status": "pending" | "confirmed" | "shipped" | "delivered",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "..."
}
```

**Search** (`?search=`): match recipientName, address, hoặc items[].name (regex, case-insensitive)

### Cart — `/api/cart`
*(requireAuth)*

| Method | Path | Body | Response |
|--------|------|------|---------|
| `GET` | `/` | — | `[{productId, name, price, quantity, emoji}]` |
| `PUT` | `/` | `{items: [...]}` | `{ok: true}` |

**Cart item format (server):** `{productId, name, price, quantity, emoji}`
**Cart item format (frontend context):** `{product: {id, name, price, emoji}, quantity}`
→ Conversion xảy ra khi sync lên server.

### Users — `/api/users`
*(checkAppKey + requireAuth + requireAdmin — tất cả endpoints)*

| Method | Path | Body/Query | Response |
|--------|------|-----------|---------|
| `GET` | `/` | `?search=&role=&sortBy=createdAt&sortDir=desc&page=1&limit=10` | `{users: [...], total, page, totalPages}` |
| `POST` | `/` | `{username, password, name, role?}` | `{...user}` 201 |
| `DELETE` | `/` | `{ids: ["id1", "id2"]}` JSON body | `{message: 'OK', deleted: N}` |
| `PATCH` | `/:id/role` | `{role: 'admin'|'customer'}` | `{...updatedUser}` |

**Bảo vệ**: Không thể xoá hoặc đổi role của user có `username === 'admin'`.

### Profile — `/api/profile`
*(requireAuth)*

| Method | Path | Body | Response |
|--------|------|------|---------|
| `GET` | `/` | — | `{id, username, name, role, avatar}` |
| `PATCH` | `/` | multipart: `name?` (bỏ trống = giữ nguyên), `avatar?` | `{id, username, name, role, avatar}` |

**Validation**: `name` nếu có phải non-empty sau trim (400 `MISSING_FIELDS` nếu chỉ có whitespace).

### Health

| Method | Path | Response |
|--------|------|---------|
| `GET` | `/api/health` | `{status: 'ok'}` |

## Models

### User
```js
{
  username: String (unique, min 3),
  password: String (bcrypt 10 rounds, auto-hash on save),
  name: String,
  role: 'admin' | 'customer' (default: 'customer'),
  avatar: String | null (base64 data URI),
  timestamps: true  // createdAt, updatedAt
}
```

### Product
```js
{
  name: String,
  price: Number,
  emoji: String,
  tag: String,
  category: String,
  stock: Number,
  timestamps: true
}
```

### Order
```js
{
  userId: Mixed (ref User._id),
  items: [{productId, name, price, quantity (min:1), emoji}],
  recipientName: String,
  recipientPhone: String,
  address: String,
  paymentMethod: 'cash' | 'card',
  paymentIntentId: String | null,
  totalPrice: Number,
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' (default: 'confirmed'),
  timestamps: true
}
// toJSON: { virtuals: true } → có virtual field 'id' = _id.toString()
```

### Cart
```js
{
  userId: Mixed (unique),
  items: [{productId, name, price, quantity, emoji}],
  timestamps: true
}
```

## Controllers

**Quan trọng**: Express 5 tự động catch async errors — không cần try/catch trong controllers. Chỉ throw Error với `status` và `errorCode` property:
```js
const err = new Error('Not found')
err.status = 404
err.errorCode = 'NOT_FOUND'
throw err
```

### orderController.js
- `getOrders()`: Build query từ userId + filters, `Promise.all([find, countDocuments])`, trả về paginated response
- `placeOrder()`: Tạo Order với status `'confirmed'`
- `deleteOrder()`: Tìm theo `{_id, userId}` (user chỉ xoá đơn của mình)
- `deleteAllOrders()`: Cùng filter logic như `getOrders()`, dùng `deleteMany()`
- `createPaymentIntent()`: Mock nếu key là `sk_test_YOUR_KEY_HERE`, thực nếu không

### authController.js
- `login()`: So sánh password bằng `bcrypt.compare()`, issue JWT với `{id, username, role}` payload
- `register()`: Lưu avatar làm base64 data URI từ `req.file.buffer`
- `getMe()`: Trả user từ DB theo `req.user.id`

### userController.js
- `getUsers()`: Paginate với `skip/limit`, sort dynamic, search regex trên username|name
- `createUser()`: Tạo user (password plain → bcrypt qua pre-save hook)
- `deleteUsers()`: Filter ids, loại trừ admin, `deleteMany()`
- `updateUserRole()`: Validate role enum, block nếu là admin user

## Cách thêm endpoint mới

```js
// 1. Thêm controller function vào controllers/<domain>Controller.js
export async function myEndpoint(req, res) {
  const data = await Model.find(...)
  res.json(data)
}

// 2. Thêm route vào routes/<domain>.js
import { myEndpoint } from '../controllers/<domain>Controller.js'
router.get('/my-path', requireAuth, myEndpoint)

// 3. Update wiki: backend.md (thêm vào bảng routes)
```
