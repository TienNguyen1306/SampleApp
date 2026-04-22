# Frontend — ShopVN

> Xem thêm: [overview.md](./overview.md) cho env vars, Vite proxy, naming conventions

## React Router — App.jsx

```jsx
// CartProvider bọc tất cả routes
<CartProvider>
  <Routes>
    <Route path="/login"             element={<LoginPage />} />
    <Route path="/register"          element={<RegisterPage />} />
    <Route path="/home"              element={<HomePage />} />
    <Route path="/cart"              element={<CartPage />} />
    <Route path="/checkout"          element={<CheckoutPage />} />
    <Route path="/orders"            element={<OrdersPage />} />
    <Route path="/profile"           element={<ProfilePage />} />
    <Route path="/admin/add-product" element={<AddProductPage />} />
    <Route path="/admin/products"    element={<AdminProductsPage />} />
    <Route path="/admin/users"       element={<AdminUsersPage />} />
    <Route path="*"                  element={<Navigate to="/login" replace />} />
  </Routes>
</CartProvider>
```

**Không có auth guard ở route level** — các page tự xử lý auth (redirect nếu cần).

## Pages

| Page | File | CSS | Mô tả |
|------|------|-----|-------|
| LoginPage | `pages/LoginPage.jsx` | `LoginPage.css` | Form login, lưu token vào sessionStorage |
| RegisterPage | `pages/RegisterPage.jsx` | `RegisterPage.css` | Form đăng ký với optional avatar upload |
| HomePage | `pages/HomePage.jsx` | `HomePage.css` | Grid sản phẩm, add to cart, admin buttons |
| CartPage | `pages/CartPage.jsx` | `CartPage.css` | Danh sách cart items, edit quantity, checkout |
| CheckoutPage | `pages/CheckoutPage.jsx` | `CheckoutPage.css` | Form giao hàng + payment (cash/card + Stripe) |
| **OrdersPage** | `pages/OrdersPage.jsx` | `OrdersPage.css` | Paginate, search, filter, delete single/all |
| ProfilePage | `pages/ProfilePage.jsx` | `ProfilePage.css` | Update tên + upload avatar |
| AdminProductsPage | `pages/AdminProductsPage.jsx` | — | CRUD sản phẩm |
| AddProductPage | `pages/AddProductPage.jsx` | — | Form thêm sản phẩm |
| AdminUsersPage | `pages/AdminUsersPage.jsx` | `AdminUsersPage.css` | CRUD users + đổi role, search, paginate |

## API Layer — `frontend/api/`

**Pattern chung**: Mỗi file export các async functions, lấy token từ `sessionStorage`, throw Error nếu response không ok:

```js
function getToken() { return sessionStorage.getItem('token') }

async function someRequest(params) {
  const res = await fetch('/api/...', {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.errorCode || data.message || 'Request failed')
  return data
}
```

### `api/auth.js`
```js
loginRequest(username, password)   // → {token, user}
registerRequest(formData)          // FormData với file → {token, user}
```

### `api/orders.js`
```js
fetchOrders({page, limit, search, status, paymentMethod})
  // → {orders: [...], pagination: {page, limit, total, totalPages}}

placeOrder({items, recipientName, recipientPhone, address, paymentMethod, paymentIntentId, totalPrice})
  // → order object

createPaymentIntent(amount)        // → {clientSecret}
deleteOrder(id)                    // → {message: 'OK'}
deleteAllOrders({search, status, paymentMethod})
  // → {message: 'OK', deleted: N}
```

### `api/products.js`
```js
fetchProducts({category, tag})     // → [product]
fetchProductById(id)               // → product
addProduct(data)                   // admin only
removeProduct(id)                  // admin only
```

### `api/users.js`
```js
// Tất cả cần X-App-Key header (APP_KEY = import.meta.env.VITE_APP_SECRET)
fetchUsers({search, role, sortBy, sortDir, page, limit})
  // → {users: [...], total, page, totalPages}

createUserRequest({username, password, name, role})
deleteUsersRequest({ids: [...]})
updateUserRoleRequest(userId, role)
```

### `api/profile.js`
```js
fetchProfile()                     // → {id, username, name, role, avatar}
updateProfile(formData)            // FormData với name? + avatar? → updated profile
```

## State Management

### Auth (sessionStorage)

```js
// Login thành công:
sessionStorage.setItem('token', token)
sessionStorage.setItem('user', JSON.stringify(user))

// Lấy token:
sessionStorage.getItem('token')

// Lấy user:
JSON.parse(sessionStorage.getItem('user'))

// Logout: xoá sessionStorage và navigate về /login
```

**Lưu ý**: sessionStorage tồn tại qua page refresh (cùng tab), mất khi đóng tab.

### CartContext — `context/CartContext.jsx`

```js
// Sử dụng:
import { useCart } from '../context/CartContext'
const { items, addToCart, updateQuantity, clearCart, totalCount, totalPrice } = useCart()

// items format: [{product: {id, name, price, emoji}, quantity}]
// totalCount: tổng số items
// totalPrice: tổng tiền
```

**Sync**: LocalStorage (persist qua refresh) + server (PUT /api/cart) khi items thay đổi.

**Cart item format trong Context vs API**:
- Context: `{product: {id, name, price, emoji}, quantity}`
- Server: `{productId, name, price, quantity, emoji}`
→ Conversion khi sync lên server trong CartContext.jsx

## i18n — `frontend/i18n/`

```js
// Detect ngôn ngữ: localStorage key 'shopvn_lang', fallback 'vi'
// Dùng trong component:
const { t } = useTranslation()
t('orders.title')           // 'Lịch sử đơn hàng'
t('orders.empty')           // 'Bạn chưa có đơn hàng nào'
t('orders.statusConfirmed') // 'Đã xác nhận'
```

**Cách thêm key mới:**
1. Thêm vào `frontend/i18n/vi.json` (tiếng Việt, required)
2. Thêm vào `frontend/i18n/en.json` (tiếng Anh)
3. Pattern key: `<pageName>.<elementName>` (camelCase)

**Key patterns phổ biến:**
```json
// vi.json
"orders": {
  "title": "Lịch sử đơn hàng",
  "back": "← Quay lại",
  "statusPending": "Đang xử lý",
  "statusConfirmed": "Đã xác nhận",
  "statusShipped": "Đang giao",
  "statusDelivered": "Đã giao"
}
```

## CSS Conventions

**Không dùng CSS framework** — mỗi page có file CSS riêng, dùng BEM-like naming:

```css
/* Prefix theo page: */
.au-*    → AdminUsersPage (au = Admin Users)
.orders-* → OrdersPage
.home-*  → HomePage
.checkout-* → CheckoutPage

/* Button classes: */
.btn-primary         → nút chính
.btn-secondary       → nút phụ
.btn-danger          → nút xoá
.btn-del-one         → nút xoá từng item trong bảng
.btn-delete-confirm  → nút confirm trong modal xoá
.back-btn            → nút quay lại
.logout-btn          → nút logout

/* State classes: */
.loading → loading indicator
.error   → error message
.success → success message (thường là .au-success, .orders-success)

/* Modal classes: */
.au-modal    → modal container AdminUsers
.au-confirm  → confirm dialog
```

## OrdersPage — Chi tiết (Branch Focus)

**State**: search (debounced via Enter key), statusFilter, paymentFilter, page, limit (5/10/20), orders[], pagination

**Data flow**:
```
[search/filter/page change]
→ useEffect calls loadOrders()
→ fetchOrders({page, limit, search, status, paymentMethod})
→ GET /api/orders?...
→ setOrders(list), setPagination(pg)
```

**Delete flow**:
- Single: Click `.btn-del-one` → confirm modal → `deleteOrder(id)` → `loadOrders()`
- All: Click `.btn-delete-all` → confirm modal → `deleteAllOrders({search, status, paymentMethod})` → `loadOrders()`

**CSS classes quan trọng** (dùng trong Playwright selectors):
```
.orders-toolbar      → toolbar (search + filters)
.orders-search-input → ô tìm kiếm
.orders-status-filter → dropdown filter status
.orders-payment-filter → dropdown filter payment
.page-size-select    → dropdown page size
.order-card          → card của 1 đơn hàng
.btn-del-one         → nút xoá 1 đơn
.btn-delete-all      → nút xoá tất cả
.order-status        → badge hiển thị status
.orders-pagination   → khu vực phân trang
.orders-prev         → nút previous page
.orders-next         → nút next page
.orders-state        → loading/empty/error state container
```

## AdminUsersPage — Chi tiết

**CSS classes quan trọng**:
```
.au-title            → h1 tiêu đề
.au-table            → bảng danh sách users
.au-table tbody tr   → mỗi row user
.au-username         → username trong row
.au-role-badge       → badge hiển thị role
.au-role-badge.role-admin → admin badge
.btn-add-user        → nút thêm user
.au-modal            → add user modal
.au-confirm          → confirm delete modal
.btn-submit          → submit trong modal
.btn-delete-confirm  → confirm delete
.btn-del-one         → xoá từng user
.au-success          → success message
.au-error            → error message
.au-search           → search input
```

**data-testid** (dùng trong Playwright):
```
add-user-name, add-user-username, add-user-password, add-user-role, add-user-cancel
```

## Cách thêm page mới

```jsx
// 1. Tạo frontend/pages/MyPage.jsx
export default function MyPage() {
  const { t } = useTranslation()
  const token = sessionStorage.getItem('token')
  // ...
}

// 2. Thêm route vào App.jsx
import MyPage from './pages/MyPage'
<Route path="/my-page" element={<MyPage />} />

// 3. Thêm i18n keys vào vi.json và en.json

// 4. Update wiki: frontend.md (thêm vào bảng Pages)
```
