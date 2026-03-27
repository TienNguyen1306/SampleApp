# ShopVN - SampleApp

Ứng dụng mua sắm demo với React, Express và MongoDB. Hỗ trợ song ngữ Tiếng Việt / English.

---

## Tính năng

| Tính năng | Mô tả |
|-----------|-------|
| 🔐 Đăng nhập / Đăng ký | JWT authentication, phân quyền admin / customer |
| 🛍️ Trang chủ | Danh sách sản phẩm, thêm vào giỏ hàng |
| 🛒 Giỏ hàng | Xem, chỉnh sửa, xoá sản phẩm trong giỏ |
| 💳 Thanh toán | COD hoặc thẻ qua Stripe (hỗ trợ mock mode) |
| 📦 Lịch sử đơn hàng | Xem toàn bộ đơn đã đặt |
| ⚙️ Quản lý sản phẩm | Admin thêm / sửa / xoá sản phẩm |
| 👥 Quản lý người dùng | Admin xem, tìm kiếm, thêm, xoá, đổi quyền user (admin only) |
| 🌐 Song ngữ | Giao diện Tiếng Việt / English, chuyển đổi bằng nút cờ 🇻🇳 / 🇺🇸 |

---

## Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu | Tải về |
|---------|-------------------|--------|
| Node.js | v18+ | https://nodejs.org |
| npm | v9+ | (đi kèm với Node.js) |
| Git | bất kỳ | https://git-scm.com |
| MongoDB | v6+ *(tuỳ chọn)* | https://www.mongodb.com/try/download/community |

> 💡 **Không có MongoDB?** Không sao — app tự động dùng **in-memory MongoDB** khi chạy dev, không cần cài thêm gì.

---

## Cài đặt nhanh (Blank machine)

### Bước 1 — Cài Node.js

**Windows (WSL / Ubuntu):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS:**
```bash
brew install node
```

Kiểm tra:
```bash
node -v   # v20.x.x
npm -v    # v10.x.x
```

---

### Bước 2 — Clone repo

```bash
git clone https://github.com/TienNguyen1306/SampleApp.git
cd SampleApp
```

---

### Bước 3 — Cài dependencies

```bash
# Dependencies chính (frontend + backend)
npm install

# Dependencies cho Playwright tests
cd automation && npm install && cd ..
```

---

### Bước 4 — Cấu hình môi trường *(tuỳ chọn)*

Tạo file `.env` ở thư mục gốc (nếu cần tuỳ chỉnh):

```env
# MongoDB — bỏ trống để dùng in-memory (mặc định cho dev)
MONGODB_URI=mongodb://localhost:27017/shopvn

# Stripe — lấy key tại https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY

# Port backend (mặc định: 3001)
PORT=3001
```

> ⚠️ Nếu không tạo file `.env`, app vẫn chạy bình thường với in-memory DB và Stripe mock mode.

---

## Khởi động

### Chạy Backend

```bash
npm run server
```

Output mong đợi:
```
✅ Connected to MongoDB (in-memory)
🌱 Database seeded: 4 users, 6 products
🚀 Server running at http://localhost:3001
```

Kiểm tra backend:
```bash
curl http://localhost:3001/api/health
# {"status":"ok"}
```

---

### Chạy Frontend

Mở terminal mới:
```bash
npm run dev
```

Output mong đợi:
```
VITE v7.x.x  ready in 300ms
➜  Local:   http://localhost:5173/
```

Mở trình duyệt: **http://localhost:5173**

---

### Tài khoản mặc định (đã seed sẵn)

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `password123` |
| Customer | `user` | `123456` |
| Customer | `testuser` | `123456` |

> 🔒 Tài khoản `admin` được bảo vệ — không thể xoá hoặc đổi quyền.

---

## Cài đặt MongoDB thật (tuỳ chọn)

Nếu muốn dùng MongoDB local thay vì in-memory:

### Ubuntu / WSL:
```bash
# Cài MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-8.0.gpg
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt-get update && sudo apt-get install -y mongodb-org

# Khởi động MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod   # auto-start khi reboot

# Kiểm tra
mongosh --eval "db.runCommand({ connectionStatus: 1 })"
```

### macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Kết nối app với MongoDB local:
```bash
MONGODB_URI=mongodb://localhost:27017/shopvn npm run server
```

---

## Chạy Playwright Tests

Đảm bảo backend và frontend đang chạy, sau đó:

```bash
cd automation

# Cài Playwright browsers (chỉ cần làm 1 lần)
npx playwright install chromium

# Chạy tất cả tests (48 tests)
npx playwright test --project=chromium

# Chạy theo nhóm
npx playwright test login --project=chromium
npx playwright test checkout --project=chromium
npx playwright test orders --project=chromium
npx playwright test user.management --project=chromium

# Xem report HTML
npx playwright show-report
```

### Danh sách test suites

| File | Số tests | Mô tả |
|------|----------|-------|
| `login.spec.ts` | 6 | Đăng nhập hợp lệ / không hợp lệ, form elements |
| `checkout.spec.ts` | 18 | Navigation, form validation, COD, card, post-payment |
| `checkout.e2e.spec.ts` | 2 | E2E checkout không mock — admin + regular user |
| `orders.spec.ts` | 14 | Empty state, order list, navigation, E2E |
| `user.management.e2e.spec.ts` | 2 | E2E quản lý user — non-admin và admin access control |
| `example.spec.ts` | 2 | Smoke tests |

---

## Cấu trúc dự án

```
SampleApp/
├── frontend/                   # React app (Vite)
│   ├── pages/
│   │   ├── LoginPage.jsx       # Đăng nhập
│   │   ├── HomePage.jsx        # Trang chủ + danh sách sản phẩm
│   │   ├── CartPage.jsx        # Giỏ hàng
│   │   ├── CheckoutPage.jsx    # Thanh toán (COD + Stripe)
│   │   ├── OrdersPage.jsx      # Lịch sử đơn hàng
│   │   ├── AdminProductsPage.jsx  # Quản lý sản phẩm (admin)
│   │   └── AdminUsersPage.jsx  # Quản lý người dùng (admin)
│   ├── components/
│   │   └── LanguageSwitcher.jsx   # Nút chuyển ngôn ngữ 🇻🇳 / 🇺🇸
│   ├── i18n/
│   │   ├── index.js            # Cấu hình react-i18next
│   │   ├── vi.json             # Bản dịch Tiếng Việt
│   │   └── en.json             # Bản dịch English
│   ├── api/
│   │   ├── auth.js             # Login / register API
│   │   ├── products.js         # Products API
│   │   ├── orders.js           # Orders + payment API
│   │   └── users.js            # User management API (admin)
│   └── context/
│       └── CartContext.jsx     # Giỏ hàng global state
├── backend/                    # Express.js API
│   ├── models/
│   │   ├── User.js             # Mongoose User model
│   │   ├── Product.js          # Mongoose Product model
│   │   ├── Order.js            # Mongoose Order model
│   │   └── Cart.js             # Mongoose Cart model
│   ├── controllers/
│   │   ├── authController.js   # Login / register logic
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── cartController.js
│   │   └── userController.js   # CRUD users (admin only)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── cart.js
│   │   └── users.js            # /api/users routes (admin only)
│   ├── middleware/
│   │   └── auth.js             # JWT verify + requireAdmin
│   ├── db.js                   # MongoDB connection
│   └── seed.js                 # Seed data mặc định
├── automation/                 # Playwright E2E tests
│   ├── tests/
│   │   ├── example.spec.ts
│   │   ├── login.spec.ts
│   │   ├── checkout.spec.ts
│   │   ├── checkout.e2e.spec.ts
│   │   ├── orders.spec.ts
│   │   └── user.management.e2e.spec.ts
│   ├── pages/                  # Page Object Models
│   │   ├── login.page.ts
│   │   ├── home.page.ts
│   │   ├── cart.page.ts
│   │   ├── checkout.page.ts
│   │   ├── orders.page.ts
│   │   └── admin.users.page.ts
│   ├── fixtures/
│   │   ├── auth.fixture.ts
│   │   ├── checkout.fixture.ts
│   │   ├── checkout.e2e.fixture.ts
│   │   └── user.management.fixture.ts
│   └── playwright.config.ts
├── server.js                   # Entry point backend
└── package.json
```

---

## API Endpoints

### Auth
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/register` | Đăng ký |

### Products
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/products` | Danh sách sản phẩm |
| POST | `/api/products` | Thêm sản phẩm *(admin)* |
| PUT | `/api/products/:id` | Sửa sản phẩm *(admin)* |
| DELETE | `/api/products/:id` | Xoá sản phẩm *(admin)* |

### Cart
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/cart` | Xem giỏ hàng |
| POST | `/api/cart` | Thêm vào giỏ hàng |
| DELETE | `/api/cart/:id` | Xoá khỏi giỏ hàng |

### Orders
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/orders` | Lịch sử đơn hàng |
| POST | `/api/orders` | Tạo đơn hàng |
| POST | `/api/payment-intent` | Tạo Stripe payment intent |

### Users *(admin only)*
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/users` | Danh sách user (search, filter, sort, paging) |
| POST | `/api/users` | Tạo user mới |
| DELETE | `/api/users` | Xoá nhiều user |
| PATCH | `/api/users/:id/role` | Đổi quyền user |

---

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 19, React Router 7, Vite 7 |
| i18n | react-i18next, i18next-browser-languagedetector |
| Backend | Node.js, Express 5 |
| Database | MongoDB + Mongoose (hoặc in-memory với mongodb-memory-server) |
| Auth | JWT (jsonwebtoken) |
| Payment | Stripe (hỗ trợ mock mode khi không có key) |
| Testing | Playwright (Page Object Model, fixtures, data-driven) |
