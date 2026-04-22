# Automation — ShopVN

> Xem thêm: [overview.md](./overview.md) cho setup; [frontend.md](./frontend.md) cho CSS selectors

## Playwright Config — `playwright.config.ts`

```ts
{
  globalSetup: './global-setup.ts',  // Warmup Vite trước khi test
  testDir: './tests',
  fullyParallel: true,
  retries: CI ? 2 : 1,              // Retry để handle flaky tests
  workers: CI ? 1 : 2,              // 2 workers local (Vite không chịu nhiều hơn)
  expect: { timeout: 10000 },       // 10s cho assertions
  use: {
    navigationTimeout: 60000,       // 60s cho waitForLoadState('networkidle')
    actionTimeout: 15000,           // 15s cho clicks, fills
  },
  projects: [
    { name: 'ui-chromium', testMatch: 'tests/ui/**/*.spec.ts', baseURL: 'http://localhost:5173' },
    { name: 'ui-webkit',   testMatch: 'tests/ui/**/*.spec.ts', baseURL: 'http://localhost:5173' },
    { name: 'api',         testMatch: 'tests/api/**/*.spec.ts', baseURL: 'http://localhost:3001' },
  ]
}
```

**Lưu ý quan trọng**:
- `ui-webkit` thường skip vì webkit không được cài trong dev environment
- `workers: 2` để tránh overload Vite dev server
- `global-setup.ts` pre-warm Vite bằng cách visit `/login`, `/admin/users`, `/orders`

## Cấu trúc tests

```
automation/
├── tests/
│   ├── ui/                         # Browser tests (baseURL: localhost:5173)
│   │   ├── login.spec.ts           # 6 tests: valid/invalid login, form validation
│   │   ├── checkout.spec.ts        # 18 tests: navigation, form validation, payment (MOCKED API)
│   │   ├── checkout.e2e.spec.ts    # 2 tests: full checkout flow (REAL API)
│   │   ├── orders.spec.ts          # 14 tests: empty state, list, pagination, search, filter, delete (MOCKED)
│   │   ├── orders.e2e.spec.ts      # 11 tests: full order history flow (REAL API)
│   │   ├── user.management.e2e.spec.ts  # 2 tests: admin create/delete user (REAL API)
│   │   ├── user.profile.e2e.spec.ts    # 1 test: register, update profile (REAL API)
│   │   └── example.spec.ts         # 2 smoke tests
│   └── api/                        # API tests (baseURL: localhost:3001)
│       ├── auth/                   # login.spec.ts, register.spec.ts, me.spec.ts
│       ├── cart/                   # get-cart.spec.ts, update-cart.spec.ts
│       ├── health/                 # health.spec.ts
│       ├── order/                  # orders.spec.ts, delete-all-orders.spec.ts
│       ├── product/                # get-products.spec.ts, add-product.spec.ts, delete-product.spec.ts
│       ├── profile/                # get-profile.spec.ts, update-profile.spec.ts
│       └── user/                   # get-users.spec.ts, create-user.spec.ts, delete-users.spec.ts, update-user-role.spec.ts
├── fixtures/
│   ├── auth.fixture.ts             # loginPage, homePage, loggedInPage, mockLoginApi
│   ├── checkout.fixture.ts         # cartPage, checkoutPage, ordersPage, mockOrdersApi, mockOrderHistoryApi
│   ├── checkout.e2e.fixture.ts     # Real API checkout fixtures
│   ├── profile.fixture.ts          # registerPage, profilePage
│   └── user.management.fixture.ts  # adminUsersPage
├── pages/                          # Page Object Model
│   ├── login.page.ts
│   ├── home.page.ts
│   ├── cart.page.ts
│   ├── checkout.page.ts
│   ├── orders.page.ts
│   ├── admin.users.page.ts
│   ├── profile.page.ts
│   └── register.page.ts
├── api-services/                   # Shared fetch wrappers cho API tests
│   ├── client.js                   # Base fetch client với buildHeaders()
│   ├── auth.service.js
│   ├── order.service.js
│   ├── user.service.js
│   ├── product.service.js
│   ├── profile.service.js
│   └── health.service.js
├── data/
│   ├── checkout.data.ts            # CheckoutScenario[], mockProducts, MockOrderResponse
│   └── users.data.ts               # Mock user data
└── assets/
    └── test-avatar.png             # Avatar dùng trong profile tests
```

## Fixtures

### auth.fixture.ts
```ts
import { test } from '../../fixtures/auth.fixture'

// Fixtures có sẵn:
// loginPage      → LoginPage instance
// homePage       → HomePage instance
// loggedInPage   → Page đã login (mocked), ở /home
// mockLoginApi   → Function mock login API
```

### checkout.fixture.ts (Mocked API)
```ts
import { test } from '../../fixtures/checkout.fixture'

// Fixtures:
// cartPage           → Page đã login + mocked products, ở cart (không có items)
// cartWithItemsPage  → Page đã login + mocked products, cart có 1 item
// checkoutPage       → Page ở checkout với 1 item trong cart
// ordersPage         → Page ở orders (mocked order history)
// mockOrdersApi      → (response) => setup mock cho POST /api/orders
// mockOrderHistoryApi → (orders) => setup mock cho GET /api/orders
```

**Quan trọng**: Checkout fixture dùng `page.route((url: URL) => url.pathname === '/api/...', ...)` (pathname predicate, không phải full URL) để intercept Vite-proxied requests.

### user.management.fixture.ts
```ts
import { test } from '../../fixtures/user.management.fixture'

// Fixtures:
// loginPage      → LoginPage instance
// adminUsersPage → AdminUsersPage instance
```

## Page Objects

### orders.page.ts — OrdersPage
```ts
class OrdersPage {
  // Locators
  searchInput: Locator       // .orders-search-input
  clearSearchBtn: Locator    // .orders-clear-search
  statusFilter: Locator      // select.orders-status-filter
  paymentFilter: Locator     // select.orders-payment-filter
  pageSizeSelect: Locator    // select.page-size-select
  orderCards: Locator        // [data-testid="order-card"]
  prevBtn: Locator           // .orders-prev
  nextBtn: Locator           // .orders-next
  pageInfo: Locator          // .orders-page-info
  deleteAllBtn: Locator      // .btn-delete-all
  deleteAllModal: Locator    // .orders-confirm-modal
  confirmDeleteAllBtn: Locator // .btn-confirm-delete-all
  cancelDeleteAllBtn: Locator  // .btn-cancel-delete-all

  // Methods
  navigate()
  search(term: string)
  clearSearch()
  filterByStatus(status: string)
  filterByPayment(method: string)
  setPageSize(size: number)
  getOrderCount(): Promise<number>
  clickDeleteAll()
  confirmDeleteAll()
  cancelDeleteAll()
}
```

### admin.users.page.ts — AdminUsersPage
```ts
class AdminUsersPage {
  pageTitle: Locator         // .au-title
  userRows: Locator          // .au-table tbody tr
  addUserButton: Locator     // .btn-add-user
  successMessage: Locator    // .au-success
  confirmDeleteModal: Locator // .au-confirm
  confirmDeleteButton: Locator // .btn-delete-confirm

  getUserRow(username: string): Locator  // filter rows by .au-username text
  getUserCount(): Promise<number>
  addUser(name, username, password, role)  // click + fill modal + wait for success
  deleteUserByUsername(username)          // click .btn-del-one + confirm
  navigate()               // goto('/admin/users') + waitForLoadState('networkidle')
  waitForLoaded()          // waitForLoadState('networkidle')
  logout()
}
```

## API Services — `api-services/`

```js
// client.js — base client
import { createClient } from '../api-services/client.js'
const client = createClient('http://localhost:3001')

// Dùng trong API tests:
const res = await client.get('/api/orders', { token })
const res = await client.post('/api/auth/login', { username, password })
const res = await client.delete('/api/orders/123', { token })

// buildHeaders({ token?, appKey? }):
// → { Authorization: 'Bearer <token>', 'X-App-Key': '<appKey>' }
```

## Patterns & Best Practices

### Serial mode cho tests với shared state
```ts
test.describe('My Suite', () => {
  test.describe.configure({ mode: 'serial' })  // ← thêm dòng này
  let token: string

  test.beforeAll(async ({ request }) => {
    // token được share cho tất cả tests trong describe
    token = (await request.post('/api/auth/login', {...}).json()).token
  })
  // ...
})
```
**Khi nào cần serial**: `beforeAll` khởi tạo shared state (token, userId) mà các tests sau dùng.

### Mock API trong UI tests
```ts
// ĐÚNG: dùng pathname predicate (Vite proxy)
await page.route((url: URL) => url.pathname === '/api/orders', route => route.fulfill({...}))

// SAI: full URL không work với Vite proxy
await page.route('http://localhost:3001/api/orders', ...)
```

### API test patterns
```ts
// Test file API chuẩn:
const KEY = process.env.APP_SECRET || ''  // Từ automation/.env

test.describe('GET /api/something', () => {
  test.describe.configure({ mode: 'serial' })

  let adminToken: string

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { username: 'admin', password: 'password123' }
    })
    adminToken = (await res.json()).token
  })

  test('positive: ...', async ({ request }) => {
    const res = await request.get('/api/something', {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY }
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('data')
  })
})
```

### E2E test patterns
```ts
// Import fixture
import { test, expect } from '../../fixtures/user.management.fixture'

test.describe('E2E - My Feature', () => {
  test.describe.configure({ mode: 'serial' })

  test('should do something end to end', async ({ loginPage, adminUsersPage }) => {
    await loginPage.navigate()
    await loginPage.login('admin', 'password123')
    await loginPage.waitForHome()

    await adminUsersPage.navigate()
    await expect(adminUsersPage.pageTitle).toBeVisible()
    // ...
  })
})
```

## Cách thêm test mới

### Thêm API test
```bash
# 1. Tạo file: automation/tests/api/<domain>/<feature>.spec.ts
# 2. Pattern: import { test, expect } from '@playwright/test'
# 3. Dùng request fixture, adminToken từ beforeAll
# 4. Thêm serial mode nếu tests dùng shared state
# 5. Không cần start browser
```

### Thêm UI test (mocked)
```bash
# 1. Tạo file: automation/tests/ui/<feature>.spec.ts
# 2. Import fixture phù hợp (checkout.fixture cho cart/checkout/orders flow)
# 3. Dùng page.route() với pathname predicate để mock APIs
# 4. Dùng page object methods thay vì raw selectors
```

### Thêm E2E test (real API)
```bash
# 1. Tạo file: automation/tests/ui/<feature>.e2e.spec.ts
# 2. Server phải đang chạy (backend + frontend)
# 3. Dùng fixture hoặc base test từ @playwright/test
# 4. Thêm serial mode, cleanup trong afterAll
```

### Thêm Page Object
```ts
// automation/pages/my-feature.page.ts
import { Page, Locator } from '@playwright/test'

export class MyFeaturePage {
  readonly page: Page
  readonly someElement: Locator

  constructor(page: Page) {
    this.page = page
    this.someElement = page.locator('.my-css-class')
  }

  async navigate() {
    await this.page.goto('/my-route')
    await this.page.waitForLoadState('networkidle')
  }
}
```

## Chạy tests

```bash
cd automation

# Tất cả (chromium + api, bỏ webkit)
npx playwright test --project=ui-chromium --project=api

# Chỉ API tests
npx playwright test --project=api

# Chỉ một file
npx playwright test tests/ui/orders.spec.ts --project=ui-chromium

# Debug mode
npx playwright test --debug

# Xem report sau khi chạy
npx playwright show-report
```

## Env Setup

```bash
# automation/.env (bắt buộc cho API tests)
APP_SECRET=shopvn-dev-app-secret

# Root .env (bắt buộc cho frontend tests)
VITE_APP_SECRET=shopvn-dev-app-secret
NODE_ENV=test
```
