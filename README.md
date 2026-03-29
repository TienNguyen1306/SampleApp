# ShopVN - SampleApp

Ứng dụng mua sắm demo với React, Express và MongoDB. Hỗ trợ song ngữ Tiếng Việt / English.

---

## Tính năng

| Tính năng | Mô tả |
|-----------|-------|
| 🔐 Đăng nhập / Đăng ký | JWT authentication, phân quyền admin / customer, hỗ trợ upload ảnh đại diện khi đăng ký |
| 👤 Trang cá nhân | Cập nhật tên, ảnh đại diện (giới hạn 5MB), hiển thị avatar trên header |
| 🛍️ Trang chủ | Danh sách sản phẩm, thêm vào giỏ hàng |
| 🛒 Giỏ hàng | Xem, chỉnh sửa, xoá sản phẩm trong giỏ |
| 💳 Thanh toán | COD hoặc thẻ qua Stripe (hỗ trợ mock mode) |
| 📦 Lịch sử đơn hàng | Xem toàn bộ đơn đã đặt |
| ⚙️ Quản lý sản phẩm | Admin thêm / xoá sản phẩm |
| 👥 Quản lý người dùng | Admin xem, tìm kiếm, thêm, xoá, đổi quyền user |
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

## Cài đặt

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

# Dependencies cho automation tests
cd automation && npm install && cd ..
```

---

### Bước 4 — Cài Playwright browsers *(chỉ cần làm 1 lần)*

```bash
cd automation
npx playwright install chromium
cd ..
```

---

### Bước 5 — Cấu hình môi trường *(tuỳ chọn)*

Tạo file `.env` ở thư mục gốc nếu cần tuỳ chỉnh:

```env
# Secrets — thay bằng giá trị ngẫu nhiên mạnh trước khi deploy
JWT_SECRET=your-strong-jwt-secret-here
APP_SECRET=your-strong-app-secret-here
VITE_APP_SECRET=your-strong-app-secret-here   # phải khớp với APP_SECRET

# MongoDB — bỏ trống để dùng in-memory (mặc định cho dev)
MONGODB_URI=mongodb://localhost:27017/shopvn

# Stripe — lấy key tại https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY

# Port backend (mặc định: 3001)
PORT=3001
```

> ⚠️ Nếu không tạo file `.env`, app vẫn chạy bình thường với in-memory DB, secret mặc định và Stripe mock mode. **Không dùng secret mặc định trên production.**

---

## Khởi động

### Terminal 1 — Chạy Backend

```bash
npm run server
```

Output mong đợi:
```
🧪 Using in-memory MongoDB: mongodb://127.0.0.1:.../
✅ MongoDB connected
✅ Seeded users
✅ Seeded products
🚀 Server running at http://localhost:3001
```

Kiểm tra:
```bash
curl http://localhost:3001/api/health
# {"status":"ok"}
```

---

### Terminal 2 — Chạy Frontend

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

## Cài đặt MongoDB thật *(tuỳ chọn)*

Nếu muốn dùng MongoDB local thay vì in-memory:

### Windows:

**Cách 1 — Installer (khuyến nghị):**

1. Tải MongoDB Community Server tại: https://www.mongodb.com/try/download/community
2. Chọn **Windows** → **msi** → Download
3. Chạy file `.msi`, chọn **Complete** → tick **Install MongoDB as a Service**
4. Sau khi cài, MongoDB tự chạy dưới dạng Windows Service

Kiểm tra:
```powershell
# Mở PowerShell (Admin)
Get-Service -Name MongoDB
# Status phải là: Running
```

Nếu chưa chạy:
```powershell
Start-Service -Name MongoDB
```

**Cách 2 — winget:**
```powershell
winget install MongoDB.Server
```

**Cách 3 — Chocolatey:**
```powershell
choco install mongodb
```

> 💡 Sau khi cài xong, MongoDB mặc định lắng nghe tại `localhost:27017`.

---

### Ubuntu / WSL:
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-8.0.gpg
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt-get update && sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Kết nối app với MongoDB local:

**Windows (PowerShell / cmd):**
```powershell
set MONGODB_URI=mongodb://localhost:27017/shopvn && npm run server
```

**macOS / Linux:**
```bash
MONGODB_URI=mongodb://localhost:27017/shopvn npm run server
```

---

## Chạy Automation Tests

Đảm bảo **cả backend lẫn frontend đang chạy** trước khi chạy tests.

```bash
cd automation
```

### Chạy API tests *(không cần frontend)*

```bash
# Chạy tất cả API tests (69 tests)
npx playwright test --project=api

# Chạy theo nhóm
npx playwright test --project=api tests/api/auth/
npx playwright test --project=api tests/api/product/
npx playwright test --project=api tests/api/user/
```

### Chạy UI tests *(cần cả backend + frontend)*

```bash
# Chạy tất cả UI tests - Chromium (49 tests)
npx playwright test --project=ui-chromium

# Chạy theo nhóm
npx playwright test --project=ui-chromium login
npx playwright test --project=ui-chromium checkout
npx playwright test --project=ui-chromium orders
npx playwright test --project=ui-chromium user.management
npx playwright test --project=ui-chromium user.profile
```

### Chạy tất cả tests

```bash
npx playwright test --project=api --project=ui-chromium
```

### Xem report HTML

```bash
npx playwright show-report
```

---

### Danh sách test suites

**UI Tests** (`tests/ui/`)

| File | Số tests | Mô tả |
|------|----------|-------|
| `login.spec.ts` | 6 | Đăng nhập hợp lệ / không hợp lệ |
| `checkout.spec.ts` | 18 | Form validation, COD, card, post-payment |
| `checkout.e2e.spec.ts` | 2 | E2E checkout — admin + regular user |
| `orders.spec.ts` | 14 | Empty state, order list, navigation |
| `user.management.e2e.spec.ts` | 2 | E2E quản lý user — admin access control |
| `user.profile.e2e.spec.ts` | 1 | E2E profile — đăng ký, cập nhật tên + avatar, verify |
| `example.spec.ts` | 2 | Smoke tests |

**API Tests** (`tests/api/`)

| Thư mục | Số tests | Endpoints |
|---------|----------|-----------|
| `auth/` | 13 | `POST /login`, `POST /register`, `GET /me` |
| `product/` | 13 | `GET /products`, `GET /products/:id`, `POST`, `DELETE` |
| `order/` | 5 | `GET /orders`, `POST /orders`, `POST /payment-intent` |
| `cart/` | 6 | `GET /cart`, `PUT /cart` |
| `user/` | 21 | `GET /users`, `POST`, `DELETE`, `PATCH /:id/role` |
| `profile/` | 7 | `GET /profile`, `PATCH /profile` |
| `health/` | 1 | `GET /health` |

---

## Cấu trúc dự án

```
SampleApp/
├── frontend/                      # React app (Vite)
│   ├── pages/
│   │   ├── LoginPage.jsx          # Đăng nhập
│   │   ├── RegisterPage.jsx       # Đăng ký (có upload avatar)
│   │   ├── HomePage.jsx           # Trang chủ + danh sách sản phẩm
│   │   ├── ProfilePage.jsx        # Trang cá nhân — đổi tên, avatar
│   │   ├── CartPage.jsx           # Giỏ hàng
│   │   ├── CheckoutPage.jsx       # Thanh toán (COD + Stripe)
│   │   ├── OrdersPage.jsx         # Lịch sử đơn hàng
│   │   ├── AddProductPage.jsx     # Thêm sản phẩm (admin)
│   │   ├── AdminProductsPage.jsx  # Quản lý sản phẩm (admin)
│   │   └── AdminUsersPage.jsx     # Quản lý người dùng (admin)
│   ├── components/
│   │   └── LanguageSwitcher.jsx   # Nút chuyển ngôn ngữ 🇻🇳 / 🇺🇸
│   ├── i18n/
│   │   ├── index.js               # Cấu hình react-i18next
│   │   ├── vi.json                # Bản dịch Tiếng Việt
│   │   └── en.json                # Bản dịch English
│   ├── api/
│   │   ├── auth.js                # Login / register API
│   │   ├── products.js            # Products API
│   │   ├── orders.js              # Orders + payment API
│   │   ├── profile.js             # Profile API
│   │   └── users.js               # User management API (admin)
│   └── context/
│       └── CartContext.jsx        # Giỏ hàng global state
├── backend/                       # Express.js API
│   ├── models/
│   │   ├── User.js                # Mongoose User model (có avatar)
│   │   ├── Product.js             # Mongoose Product model
│   │   ├── Order.js               # Mongoose Order model
│   │   └── Cart.js                # Mongoose Cart model
│   ├── controllers/
│   │   ├── authController.js      # Login / register / me
│   │   ├── profileController.js   # Get / update profile
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── cartController.js
│   │   └── userController.js      # CRUD users (admin only)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── profile.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── cart.js
│   │   └── users.js
│   ├── middleware/
│   │   ├── auth.js                # JWT verify
│   │   ├── requireAdmin.js        # Admin-only guard
│   │   └── upload.js              # Multer file upload (5MB limit)
│   ├── db.js                      # MongoDB connection
│   └── seed.js                    # Seed data mặc định
├── automation/                    # Playwright tests
│   ├── tests/
│   │   ├── ui/                    # UI / E2E tests (cần browser)
│   │   │   ├── login.spec.ts
│   │   │   ├── checkout.spec.ts
│   │   │   ├── checkout.e2e.spec.ts
│   │   │   ├── orders.spec.ts
│   │   │   ├── user.management.e2e.spec.ts
│   │   │   ├── user.profile.e2e.spec.ts
│   │   │   └── example.spec.ts
│   │   └── api/                   # API tests (không cần browser)
│   │       ├── auth/
│   │       ├── product/
│   │       ├── order/
│   │       ├── cart/
│   │       ├── user/
│   │       ├── profile/
│   │       └── health/
│   ├── pages/                     # Page Object Models
│   │   ├── login.page.ts
│   │   ├── home.page.ts
│   │   ├── cart.page.ts
│   │   ├── checkout.page.ts
│   │   ├── orders.page.ts
│   │   ├── register.page.ts
│   │   ├── profile.page.ts
│   │   └── admin.users.page.ts
│   ├── fixtures/
│   │   ├── auth.fixture.ts
│   │   ├── api.fixture.ts
│   │   ├── checkout.fixture.ts
│   │   ├── checkout.e2e.fixture.ts
│   │   ├── profile.fixture.ts
│   │   └── user.management.fixture.ts
│   ├── api-services/              # Service layer cho API tests
│   │   ├── client.js
│   │   ├── auth.service.js
│   │   ├── product.service.js
│   │   ├── order.service.js
│   │   ├── cart.service.js
│   │   ├── user.service.js
│   │   ├── profile.service.js
│   │   ├── health.service.js
│   │   └── index.js
│   └── playwright.config.ts
├── server.js                      # Entry point backend
└── package.json
```

---

## API Endpoints

### Health
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/health` | — | Health check |

### Auth
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/api/auth/login` | — | Đăng nhập, trả về JWT token |
| POST | `/api/auth/register` | — | Đăng ký tài khoản mới |
| GET | `/api/auth/me` | ✅ | Thông tin user hiện tại |

### Profile
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/profile` | ✅ | Xem trang cá nhân |
| PATCH | `/api/profile` | ✅ | Cập nhật tên / ảnh đại diện |

### Products
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/products` | ✅ | Danh sách sản phẩm (filter theo category, tag) |
| GET | `/api/products/:id` | ✅ | Chi tiết sản phẩm |
| POST | `/api/products` | ✅ Admin | Thêm sản phẩm |
| DELETE | `/api/products/:id` | ✅ Admin | Xoá sản phẩm |

### Cart
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/cart` | ✅ | Xem giỏ hàng |
| PUT | `/api/cart` | ✅ | Cập nhật giỏ hàng |

### Orders
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/orders` | ✅ | Lịch sử đơn hàng |
| POST | `/api/orders` | ✅ | Tạo đơn hàng |
| POST | `/api/orders/payment-intent` | ✅ | Tạo Stripe payment intent |

---

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 19, React Router 7, Vite 7 |
| i18n | react-i18next, i18next-browser-languagedetector |
| Backend | Node.js, Express 5 |
| Database | MongoDB + Mongoose (hoặc in-memory với mongodb-memory-server) |
| Auth | JWT (jsonwebtoken) |
| File Upload | Multer (ảnh đại diện, giới hạn 5MB) |
| Payment | Stripe (hỗ trợ mock mode khi không có key) |
| Testing | Playwright (Page Object Model, fixtures, data-driven, API tests) |
