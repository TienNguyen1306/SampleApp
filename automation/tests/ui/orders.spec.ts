import { test, expect } from '../../fixtures/checkout.fixture';
import { mockOrder, mockOrderHistory } from '../../data/checkout.data';
import { LoginPage } from '../../pages/login.page';
import { HomePage } from '../../pages/home.page';
import { CartPage } from '../../pages/cart.page';
import { CheckoutPage } from '../../pages/checkout.page';
import { OrdersPage } from '../../pages/orders.page';

const ORDERS_API_URL = 'http://localhost:3001/api/orders';
const PRODUCTS_API_URL = 'http://localhost:3001/api/products';
const LOGIN_API_URL = 'http://localhost:3001/api/auth/login';
const PAYMENT_INTENT_API_URL = 'http://localhost:3001/api/orders/payment-intent';

test.describe('Order History Page', () => {

  test.describe('Empty state', () => {
    test('should display empty state when no orders', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([]);
      await ordersPage.navigate();

      await expect(ordersPage.emptyState).toBeVisible();
      await expect(ordersPage.emptyState).toContainText('Bạn chưa có đơn hàng nào');
      await ordersPage.assertOrderCount(0);
    });

    test('should show "Mua sắm ngay" button when empty', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([]);
      await ordersPage.navigate();

      await ordersPage.assertShopNowVisible();
    });

    test('should navigate to home when clicking "Mua sắm ngay"', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([]);
      await ordersPage.navigate();

      await ordersPage.clickShopNow();
      await ordersPage.assertOnHome();
    });
  });

  test.describe('Order list', () => {
    test('should display all orders', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi(mockOrderHistory);
      await ordersPage.navigate();

      await ordersPage.assertOrderCount(mockOrderHistory.length);
    });

    test('should display order ID for each order', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([mockOrder]);
      await ordersPage.navigate();

      await expect(ordersPage.getOrderById(mockOrder.id)).toBeVisible();
    });

    test('should display order items with name and quantity', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([mockOrder]);
      await ordersPage.navigate();

      await expect(ordersPage.getOrderItemName(0)).toContainText('Áo thun nam');
      await expect(ordersPage.getOrderItemQty(0)).toContainText('×1');
    });

    test('should display recipient name and address', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([mockOrder]);
      await ordersPage.navigate();

      await expect(ordersPage.getOrderRecipient(0)).toContainText(mockOrder.recipientName);
      await expect(ordersPage.getOrderRecipient(0)).toContainText(mockOrder.address);
    });

    test('should display payment method — cash', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([mockOrder]);
      await ordersPage.navigate();

      await expect(ordersPage.getOrderPayment(0)).toContainText('Tiền mặt');
    });

    test('should display payment method — card', async ({ ordersPage, mockOrderHistoryApi }) => {
      const cardOrder = { ...mockOrder, id: 3, paymentMethod: 'card' as const, paymentIntentId: 'mock_pi' };
      await mockOrderHistoryApi([cardOrder]);
      await ordersPage.navigate();

      await expect(ordersPage.getOrderPayment(0)).toContainText('Thẻ');
    });

    test('should display total price', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([mockOrder]);
      await ordersPage.navigate();

      await expect(ordersPage.getOrderTotal(0)).toContainText('199.000đ');
    });

    test('should display "Đã xác nhận" status badge', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([mockOrder]);
      await ordersPage.navigate();

      await expect(ordersPage.getOrderStatus(0)).toContainText('Đã xác nhận');
    });
  });

  test.describe('Navigation', () => {
    test('should be accessible from home page via "Đơn hàng" button', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([]);
      await ordersPage.navigateToHome();
      await ordersPage.setupProductsAndOrdersMock(PRODUCTS_API_URL, ORDERS_API_URL, [], []);

      await ordersPage.clickOrdersNavButton();
      await ordersPage.assertOnOrders();
    });

    test('should navigate back to home when clicking "← Trang chủ"', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([]);
      await ordersPage.navigate();

      await ordersPage.clickBackButton();
      await ordersPage.assertOnHome();
    });

    test('should display page title', async ({ ordersPage, mockOrderHistoryApi }) => {
      await mockOrderHistoryApi([]);
      await ordersPage.navigate();

      await ordersPage.assertPageTitleVisible();
    });
  });

  test.describe('End-to-end: order appears in history after checkout', () => {
    test('should show new order in history after successful payment', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const homePage = new HomePage(page);
      const cartPage = new CartPage(page);
      const checkoutPage = new CheckoutPage(page);
      const ordersPage = new OrdersPage(page);

      // ── Mock setup ──────────────────────────────────────────────────────
      const createdOrder = { ...mockOrder, id: 99 };

      await page.route(LOGIN_API_URL, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MzI4NDAwNywiZXhwIjoxNzczODg4ODA3fQ.BQ7Jv5xKfelseHdrcCHzeFtnhN5o0CpCJwqKWJGJcDg',
            user: { id: 1, username: 'admin', name: 'Admin User', role: 'admin' },
          }),
        })
      );
      await page.route(PRODUCTS_API_URL, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 1, name: 'Áo thun nam', price: 199000, emoji: '👕', tag: 'Mới', category: 'Thời trang', stock: 50 },
          ]),
        })
      );
      await page.route(PAYMENT_INTENT_API_URL, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ clientSecret: `mock_pi_${Date.now()}_secret_mock` }),
        })
      );
      await page.route(ORDERS_API_URL, (route) => {
        if (route.request().method() === 'POST') {
          route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(createdOrder) });
        } else if (route.request().method() === 'GET') {
          route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([createdOrder]) });
        } else {
          route.continue();
        }
      });

      // ── Login via PO ─────────────────────────────────────────────────────
      await loginPage.navigate();
      await loginPage.login('admin', 'password123');
      await loginPage.waitForHome();

      // ── Add product to cart and navigate via PO ───────────────────────────
      await homePage.addFirstProductToCart();
      await homePage.clickCart();

      // ── Proceed to checkout via PO ────────────────────────────────────────
      await cartPage.clickCheckout();
      await checkoutPage.waitForCheckout();

      // ── Fill form and submit via PO ───────────────────────────────────────
      await checkoutPage.fillForm({
        recipientName: 'Nguyễn Văn A',
        recipientPhone: '0912345678',
        address: '123 Đường Lê Lợi, TP. HCM',
      });
      await checkoutPage.submit();

      // ── Verify success via PO ─────────────────────────────────────────────
      await checkoutPage.assertSuccess();

      // ── Navigate to order history via PO ─────────────────────────────────
      await checkoutPage.clickContinueShopping();
      await homePage.clickOrders();

      // ── Verify order in history via PO ────────────────────────────────────
      await ordersPage.assertOrderCount(1);
      await ordersPage.assertOrderCardContains(0, '#99');
    });
  });

});
