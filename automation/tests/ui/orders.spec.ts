import { test, expect } from '../../fixtures/checkout.fixture';
import { mockOrder, mockOrderHistory } from '../../data/checkout.data';

const ORDERS_API_URL = 'http://localhost:3001/api/orders';

test.describe('Order History Page', () => {

  test.describe('Empty state', () => {
    test('should display empty state when no orders', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([]);
      await ordersPage.navigate();

      await expect(ordersPage.emptyState).toBeVisible();
      await expect(ordersPage.emptyState).toContainText('Bạn chưa có đơn hàng nào');
      await expect(ordersPage.orderCards).toHaveCount(0);
    });

    test('should show "Mua sắm ngay" button when empty', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([]);
      await ordersPage.navigate();

      await expect(ordersPage.page.getByRole('button', { name: 'Mua sắm ngay' })).toBeVisible();
    });

    test('should navigate to home when clicking "Mua sắm ngay"', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([]);
      await ordersPage.navigate();

      await ordersPage.page.getByRole('button', { name: 'Mua sắm ngay' }).click();
      await expect(ordersPage.page).toHaveURL(/\/home/);
    });
  });

  test.describe('Order list', () => {
    test('should display all orders', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi(mockOrderHistory);
      await ordersPage.navigate();

      await expect(ordersPage.orderCards).toHaveCount(mockOrderHistory.length);
    });

    test('should display order ID for each order', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([mockOrder]);
      await ordersPage.navigate();

      await expect(ordersPage.getOrderById(mockOrder.id)).toBeVisible();
    });

    test('should display order items with name and quantity', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([mockOrder]);
      await ordersPage.navigate();

      const card = ordersPage.getOrderCard(0);
      await expect(card.locator('.order-item-name')).toContainText('Áo thun nam');
      await expect(card.locator('.order-item-qty')).toContainText('×1');
    });

    test('should display recipient name and address', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([mockOrder]);
      await ordersPage.navigate();

      const card = ordersPage.getOrderCard(0);
      await expect(card.locator('.order-recipient')).toContainText(mockOrder.recipientName);
      await expect(card.locator('.order-recipient')).toContainText(mockOrder.address);
    });

    test('should display payment method — cash', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([mockOrder]);
      await ordersPage.navigate();

      await expect(ordersPage.getOrderCard(0).locator('.order-payment')).toContainText('Tiền mặt');
    });

    test('should display payment method — card', async ({ ordersPage, mockOrderHistoryApi }) => {
      const cardOrder = { ...mockOrder, id: 3, paymentMethod: 'card' as const, paymentIntentId: 'mock_pi' };
      await mockOrderHistoryApi([cardOrder]);
      await ordersPage.navigate();

      await expect(ordersPage.getOrderCard(0).locator('.order-payment')).toContainText('Thẻ');
    });

    test('should display total price', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([mockOrder]);
      await ordersPage.navigate();

      await expect(ordersPage.getOrderCard(0).locator('.order-total')).toContainText('199.000đ');
    });

    test('should display "Đã xác nhận" status badge', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([mockOrder]);
      await ordersPage.navigate();

      await expect(ordersPage.getOrderCard(0).locator('.order-status')).toContainText('Đã xác nhận');
    });
  });

  test.describe('Navigation', () => {
    test('should be accessible from home page via "Đơn hàng" button', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([]);
      // Navigate to home first, then click orders button
      await ordersPage.page.goto('/home');
      await ordersPage.page.route('http://localhost:3001/api/products', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
      );
      await ordersPage.page.route(ORDERS_API_URL, (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
      );

      await ordersPage.page.getByRole('button', { name: '📦 Đơn hàng' }).click();
      await expect(ordersPage.page).toHaveURL(/\/orders/);
    });

    test('should navigate back to home when clicking "← Trang chủ"', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([]);
      await ordersPage.navigate();

      await ordersPage.page.getByRole('button', { name: '← Trang chủ' }).click();
      await expect(ordersPage.page).toHaveURL(/\/home/);
    });

    test('should display page title', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([]);
      await ordersPage.navigate();

      await expect(ordersPage.pageTitle).toBeVisible();
    });
  });

  test.describe('End-to-end: order appears in history after checkout', () => {
    test('should show new order in history after successful payment', async ({ page }) => {
      const LOGIN_API = 'http://localhost:3001/api/auth/login';
      const PRODUCTS_API = 'http://localhost:3001/api/products';
      const PAYMENT_INTENT_API = 'http://localhost:3001/api/orders/payment-intent';

      // Setup mocks
      await page.route(LOGIN_API, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MzI4NDAwNywiZXhwIjoxNzczODg4ODA3fQ.BQ7Jv5xKfelseHdrcCHzeFtnhN5o0CpCJwqKWJGJcDg',
            user: { id: 1, username: 'admin', name: 'Admin User', role: 'admin' },
          }),
        })
      );
      await page.route(PRODUCTS_API, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 1, name: 'Áo thun nam', price: 199000, emoji: '👕', tag: 'Mới', category: 'Thời trang', stock: 50 },
          ]),
        })
      );
      await page.route(PAYMENT_INTENT_API, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ clientSecret: `mock_pi_${Date.now()}_secret_mock` }),
        })
      );

      // Mock POST /api/orders to create order
      const createdOrder = { ...mockOrder, id: 99 };
      await page.route(ORDERS_API_URL, (route) => {
        if (route.request().method() === 'POST') {
          route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify(createdOrder),
          });
        } else if (route.request().method() === 'GET') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([createdOrder]),
          });
        } else {
          route.continue();
        }
      });

      // Login → add to cart → checkout → pay
      await page.goto('/login');
      await page.getByRole('textbox', { name: 'Tài khoản' }).fill('admin');
      await page.getByRole('textbox', { name: 'Mật khẩu' }).fill('password123');
      await page.getByRole('button', { name: 'Đăng nhập' }).click();
      await page.waitForURL('**/home');
      await page.waitForSelector('.product-card');
      await page.locator('.add-to-cart').first().click();

      // SPA-navigate to preserve React cart state
      await page.locator('.cart-btn').click();
      await page.waitForURL('**/cart');
      await page.getByRole('button', { name: 'Thanh toán ngay' }).click();
      await page.waitForURL('**/checkout');

      await page.getByPlaceholder('Nguyễn Văn A').fill('Nguyễn Văn A');
      await page.getByPlaceholder('0912 345 678').fill('0912345678');
      await page.getByPlaceholder('123 Đường ABC, Phường XYZ, TP. HCM').fill('123 Đường Lê Lợi, TP. HCM');
      await page.locator('.btn-checkout').click();

      await expect(page.getByRole('heading', { name: 'Đặt hàng thành công!' })).toBeVisible();

      // Go to order history
      await page.getByRole('button', { name: 'Tiếp tục mua sắm' }).click();
      await page.getByRole('button', { name: '📦 Đơn hàng' }).click();
      await page.waitForURL('**/orders');

      await expect(page.locator('.order-card')).toHaveCount(1);
      await expect(page.locator('.order-card').first()).toContainText('#99');
    });
  });

});
