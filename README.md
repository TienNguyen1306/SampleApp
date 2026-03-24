# ShopVN - SampleApp

Ứng dụng mua sắm demo với React, Express và MongoDB.

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
🌱 Database seeded: 2 users, 6 products
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

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@shopvn.com` | `admin123` |
| User | `user@shopvn.com` | `user123` |

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

# Chạy tất cả tests
npx playwright test --project=chromium

# Chạy test cụ thể
npx playwright test login --project=chromium

# Xem report HTML
npx playwright show-report
```

---

## Cấu trúc dự án

```
SampleApp/
├── frontend/               # React app (Vite)
│   ├── pages/              # LoginPage, HomePage, CartPage, ...
│   ├── context/            # Auth context
│   └── api/                # API calls
├── backend/                # Express.js API
│   ├── models/             # Mongoose models (User, Product, Order, Cart)
│   ├── controllers/        # Business logic
│   ├── routes/             # API routes
│   ├── db.js               # MongoDB connection
│   └── seed.js             # Seed data mặc định
├── automation/             # Playwright E2E tests
│   ├── tests/              # Test files
│   ├── pages/              # Page Object Models
│   └── playwright.config.ts
├── server.js               # Entry point backend
└── package.json
```

---

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/register` | Đăng ký |
| GET | `/api/products` | Danh sách sản phẩm |
| POST | `/api/products` | Thêm sản phẩm *(admin)* |
| GET | `/api/cart` | Xem giỏ hàng |
| POST | `/api/cart` | Thêm vào giỏ hàng |
| DELETE | `/api/cart/:id` | Xoá khỏi giỏ hàng |
| GET | `/api/orders` | Lịch sử đơn hàng |
| POST | `/api/orders` | Tạo đơn hàng |

---

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 19, React Router 7, Vite 7 |
| Backend | Node.js, Express 5 |
| Database | MongoDB + Mongoose (hoặc in-memory) |
| Auth | JWT |
| Payment | Stripe |
| Testing | Playwright |
