import { test, expect } from '../../fixtures/checkout.fixture';
import { mockOrder, mockOrderHistory, MockOrderResponse } from '../../data/checkout.data';
import { LoginPage } from '../../pages/login.page';
import { HomePage } from '../../pages/home.page';
import { CartPage } from '../../pages/cart.page';
import { CheckoutPage } from '../../pages/checkout.page';
import { OrdersPage } from '../../pages/orders.page';
import type { Page } from '@playwright/test';

const ORDERS_API_URL = 'http://localhost:3001/api/orders';
const PRODUCTS_API_URL = 'http://localhost:3001/api/products';
const LOGIN_API_URL = 'http://localhost:3001/api/auth/login';
const PAYMENT_INTENT_API_URL = 'http://localhost:3001/api/orders/payment-intent';

// ── Helper: dynamic mock that mirrors real API filtering/pagination ────────────
async function setupSmartOrdersMock(page: Page, allOrders: MockOrderResponse[]) {
  await page.route(
    (url: URL) => url.pathname === '/api/orders',
    (route) => {
      if (route.request().method() === 'GET') {
        const url = new URL(route.request().url());
        const search = url.searchParams.get('search')?.toLowerCase() || '';
        const status = url.searchParams.get('status') || '';
        const paymentMethod = url.searchParams.get('paymentMethod') || '';
        const pg = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');

        let filtered = [...allOrders];
        if (search) {
          filtered = filtered.filter((o) =>
            o.recipientName.toLowerCase().includes(search) ||
            o.address.toLowerCase().includes(search) ||
            o.items.some((i) => i.name.toLowerCase().includes(search))
          );
        }
        if (status) filtered = filtered.filter((o) => o.status === status);
        if (paymentMethod) filtered = filtered.filter((o) => o.paymentMethod === paymentMethod);

        const total = filtered.length;
        const paginated = filtered.slice((pg - 1) * limit, pg * limit);

        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            orders: paginated,
            pagination: { page: pg, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
          }),
        });
      } else {
        route.continue();
      }
    }
  );
}

// ── Helper: mock DELETE /api/orders/:id ───────────────────────────────────────
async function setupDeleteOrderMock(page: Page) {
  await page.route(
    (url: URL) => /^\/api\/orders\/.+/.test(url.pathname),
    (route) => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'OK' }) });
      } else {
        route.continue();
      }
    }
  );
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const mixedOrders: MockOrderResponse[] = [
  mockOrder,
  {
    id: 2,
    userId: 1,
    items: [{ id: 2, name: 'Giày sneaker', price: 599000, emoji: '👟', quantity: 2 }],
    recipientName: 'Trần Thị B',
    recipientPhone: '0987654321',
    address: '456 Đường Nguyễn Huệ, TP. HCM',
    paymentMethod: 'card',
    paymentIntentId: 'mock_pi',
    totalPrice: 1198000,
    status: 'shipped',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    userId: 1,
    items: [{ id: 1, name: 'Áo thun nam', price: 199000, emoji: '👕', quantity: 3 }],
    recipientName: 'Lê Văn C',
    recipientPhone: '0911222333',
    address: '789 Đường Trần Hưng Đạo, TP. HCM',
    paymentMethod: 'cash',
    paymentIntentId: null,
    totalPrice: 597000,
    status: 'delivered',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

// 12 mock orders for pagination test (exceeds page size of 10)
const manyOrders: MockOrderResponse[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  userId: 1,
  items: [{ id: 1, name: `Sản phẩm ${i + 1}`, price: 100000, emoji: '📦', quantity: 1 }],
  recipientName: `Người nhận ${i + 1}`,
  recipientPhone: '0912345678',
  address: `Địa chỉ ${i + 1}`,
  paymentMethod: 'cash' as const,
  paymentIntentId: null,
  totalPrice: 100000,
  status: 'confirmed',
  createdAt: new Date(Date.now() - i * 3600000).toISOString(),
}));

// ─────────────────────────────────────────────────────────────────────────────

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

  // ── NEW: Search ─────────────────────────────────────────────────────────────
  test.describe('Search', () => {
    test('should show only matching orders when searching by product name', async ({ ordersPage, page }) => {
      await setupSmartOrdersMock(page, mixedOrders);
      await ordersPage.navigate();
      await ordersPage.assertOrderCount(3);

      await ordersPage.search('Giày sneaker');

      await ordersPage.assertOrderCount(1);
      await expect(ordersPage.getOrderItemName(0)).toContainText('Giày sneaker');
    });

    test('should show only matching orders when searching by recipient name', async ({ ordersPage, page }) => {
      await setupSmartOrdersMock(page, mixedOrders);
      await ordersPage.navigate();

      await ordersPage.search('Trần Thị B');

      await ordersPage.assertOrderCount(1);
      await expect(ordersPage.getOrderRecipient(0)).toContainText('Trần Thị B');
    });

    test('should show no-results message when search has no matches', async ({ ordersPage, page }) => {
      await setupSmartOrdersMock(page, mixedOrders);
      await ordersPage.navigate();

      await ordersPage.search('không tồn tại xyz');

      await ordersPage.assertOrderCount(0);
      await ordersPage.assertNoResultsVisible();
      await expect(ordersPage.emptyState).toContainText('Không tìm thấy đơn hàng phù hợp');
    });

    test('should submit search by pressing Enter', async ({ ordersPage, page }) => {
      await setupSmartOrdersMock(page, mixedOrders);
      await ordersPage.navigate();

      await ordersPage.searchWithEnter('Áo thun');

      await ordersPage.assertOrderCount(2);
    });
  });

  // ── NEW: Filter ─────────────────────────────────────────────────────────────
  test.describe('Filter', () => {
    test('should filter orders by status', async ({ ordersPage, page }) => {
      await setupSmartOrdersMock(page, mixedOrders);
      await ordersPage.navigate();
      await ordersPage.assertOrderCount(3);

      await ordersPage.filterByStatus('shipped');

      await ordersPage.assertOrderCount(1);
      await expect(ordersPage.getOrderStatus(0)).toContainText('Đang giao');
    });

    test('should filter orders by payment method — cash', async ({ ordersPage, page }) => {
      await setupSmartOrdersMock(page, mixedOrders);
      await ordersPage.navigate();

      await ordersPage.filterByPayment('cash');

      await ordersPage.assertOrderCount(2);
      for (let i = 0; i < 2; i++) {
        await expect(ordersPage.getOrderPayment(i)).toContainText('Tiền mặt');
      }
    });

    test('should filter orders by payment method — card', async ({ ordersPage, page }) => {
      await setupSmartOrdersMock(page, mixedOrders);
      await ordersPage.navigate();

      await ordersPage.filterByPayment('card');

      await ordersPage.assertOrderCount(1);
      await expect(ordersPage.getOrderPayment(0)).toContainText('Thẻ');
    });

    test('should combine search and status filter', async ({ ordersPage, page }) => {
      await setupSmartOrdersMock(page, mixedOrders);
      await ordersPage.navigate();

      // Filter to cash only (2 results), then search further
      await ordersPage.filterByPayment('cash');
      await ordersPage.assertOrderCount(2);

      await ordersPage.search('Lê Văn C');
      await ordersPage.assertOrderCount(1);
      await expect(ordersPage.getOrderRecipient(0)).toContainText('Lê Văn C');
    });
  });

  // ── NEW: Pagination ─────────────────────────────────────────────────────────
  test.describe('Pagination', () => {
    test('should show pagination controls when there are multiple pages', async ({ ordersPage, page }) => {
      await setupSmartOrdersMock(page, manyOrders);
      await ordersPage.navigate();

      await ordersPage.assertPaginationVisible();
      await ordersPage.assertOrderCount(10); // default page size
    });

    test('should disable Prev button on first page', async ({ ordersPage, page }) => {
      await setupSmartOrdersMock(page, manyOrders);
      await ordersPage.navigate();

      await ordersPage.assertPrevButtonDisabled();
    });

    test('should navigate to next page and show remaining orders', async ({ ordersPage, page }) => {
      await setupSmartOrdersMock(page, manyOrders);
      await ordersPage.navigate();

      await ordersPage.assertOrderCount(10);
      await ordersPage.goToNextPage();
      await ordersPage.assertOrderCount(2); // 12 total, 10 on page 1, 2 on page 2
    });

    test('should disable Next button on last page', async ({ ordersPage, page }) => {
      await setupSmartOrdersMock(page, manyOrders);
      await ordersPage.navigate();

      await ordersPage.goToNextPage();
      await ordersPage.assertNextButtonDisabled();
    });

    test('should navigate back to previous page', async ({ ordersPage, page }) => {
      await setupSmartOrdersMock(page, manyOrders);
      await ordersPage.navigate();

      await ordersPage.goToNextPage();
      await ordersPage.assertOrderCount(2);

      await ordersPage.goToPrevPage();
      await ordersPage.assertOrderCount(10);
      await ordersPage.assertPrevButtonDisabled();
    });
  });

  // ── NEW: Delete ─────────────────────────────────────────────────────────────
  test.describe('Delete order', () => {
    test('should show confirmation modal when clicking delete button', async ({ ordersPage, page }) => {
      await setupSmartOrdersMock(page, [mockOrder]);
      await ordersPage.navigate();

      await ordersPage.assertOrderCount(1);
      await ordersPage.clickDeleteOnCard(0);

      await ordersPage.assertDeleteModalVisible();
    });

    test('should close modal without deleting when clicking Hủy', async ({ ordersPage, page }) => {
      await setupSmartOrdersMock(page, mixedOrders);
      await ordersPage.navigate();

      await ordersPage.clickDeleteOnCard(0);
      await ordersPage.assertDeleteModalVisible();

      await ordersPage.cancelDelete();

      await ordersPage.assertDeleteModalHidden();
      await ordersPage.assertOrderCount(3); // still 3 orders
    });

    test('should remove order from list after confirming delete', async ({ ordersPage, page }) => {
      // Track remaining orders after deletion
      const remainingOrders = mixedOrders.slice(1); // remove first order
      let deleted = false;

      await page.route(
        (url: URL) => /^\/api\/orders\/.+/.test(url.pathname),
        (route) => {
          if (route.request().method() === 'DELETE') {
            deleted = true;
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'OK' }) });
          } else {
            route.continue();
          }
        }
      );

      await page.route(
        (url: URL) => url.pathname === '/api/orders',
        (route) => {
          if (route.request().method() === 'GET') {
            const orders = deleted ? remainingOrders : mixedOrders;
            route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                orders,
                pagination: { page: 1, limit: 10, total: orders.length, totalPages: 1 },
              }),
            });
          } else {
            route.continue();
          }
        }
      );

      await ordersPage.navigate();
      await ordersPage.assertOrderCount(3);

      await ordersPage.clickDeleteOnCard(0);
      await ordersPage.assertDeleteModalVisible();
      await ordersPage.confirmDelete();

      await ordersPage.assertOrderCount(2);
    });
  });

  // ── Delete all orders ─────────────────────────────────────────────────────
  test.describe('Delete all orders', () => {
    test('should show delete-all button when orders are present', async ({ ordersPage, page }) => {
      await setupSmartOrdersMock(page, mixedOrders);
      await ordersPage.navigate();

      await ordersPage.assertOrderCount(3);
      await ordersPage.assertDeleteAllButtonVisible();
    });

    test('should not show delete-all button when list is empty', async ({ ordersPage, page }) => {
      await setupSmartOrdersMock(page, []);
      await ordersPage.navigate();

      await ordersPage.assertDeleteAllButtonHidden();
    });

    test('should open confirmation modal when clicking delete-all', async ({ ordersPage, page }) => {
      await setupSmartOrdersMock(page, mixedOrders);
      await ordersPage.navigate();

      await ordersPage.clickDeleteAll();
      await ordersPage.assertDeleteAllModalVisible();
    });

    test('should cancel delete-all and keep all orders', async ({ ordersPage, page }) => {
      await setupSmartOrdersMock(page, mixedOrders);
      await ordersPage.navigate();

      await ordersPage.clickDeleteAll();
      await ordersPage.assertDeleteAllModalVisible();
      await ordersPage.cancelDeleteAll();

      await ordersPage.assertDeleteAllModalHidden();
      await ordersPage.assertOrderCount(3); // all orders still present
    });

    test('should delete all orders and show empty state after confirming', async ({ ordersPage, page }) => {
      let allDeleted = false;

      // Mock DELETE /api/orders (no :id segment)
      await page.route(
        (url: URL) => url.pathname === '/api/orders',
        (route) => {
          if (route.request().method() === 'DELETE') {
            allDeleted = true;
            route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ message: 'OK', deleted: mixedOrders.length }),
            });
          } else if (route.request().method() === 'GET') {
            const orders = allDeleted ? [] : mixedOrders;
            route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                orders,
                pagination: { page: 1, limit: 10, total: orders.length, totalPages: 1 },
              }),
            });
          } else {
            route.continue();
          }
        }
      );

      await ordersPage.navigate();
      await ordersPage.assertOrderCount(3);

      // Register dialog handler early so alert() after deletion is caught
      page.on('dialog', (dialog) => dialog.accept());
      await ordersPage.clickDeleteAll();
      await ordersPage.assertDeleteAllModalVisible();
      await ordersPage.confirmDeleteAll();

      await ordersPage.assertOrderCount(0);
    });

    test('should delete only filtered orders when filter is active', async ({ ordersPage, page }) => {
      // Keep cash orders in list, delete the card one
      const cashOrders = mixedOrders.filter((o) => o.paymentMethod === 'cash');
      let filterDeleted = false;

      await page.route(
        (url: URL) => url.pathname === '/api/orders',
        (route) => {
          if (route.request().method() === 'DELETE') {
            filterDeleted = true;
            route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ message: 'OK', deleted: 1 }),
            });
          } else if (route.request().method() === 'GET') {
            const url = new URL(route.request().url());
            const paymentMethod = url.searchParams.get('paymentMethod') || '';
            let orders = filterDeleted ? cashOrders : mixedOrders;
            if (paymentMethod) orders = orders.filter((o) => o.paymentMethod === paymentMethod);
            route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                orders,
                pagination: { page: 1, limit: 10, total: orders.length, totalPages: 1 },
              }),
            });
          } else {
            route.continue();
          }
        }
      );

      await ordersPage.navigate();
      // Filter to card orders (1 result)
      await ordersPage.filterByPayment('card');
      await ordersPage.assertOrderCount(1);

      // Register dialog handler early so alert() after deletion is caught
      page.on('dialog', (dialog) => dialog.accept());

      // Delete all card orders
      await ordersPage.clickDeleteAll();
      await ordersPage.assertDeleteAllModalVisible();
      await ordersPage.confirmDeleteAll();

      // Remove filter — cash orders should remain
      await ordersPage.filterByPayment('');
      await ordersPage.assertOrderCount(2);
    });
  });

  // ── Existing E2E: order appears in history after checkout ───────────────────
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
      await page.route(
        (url: URL) => url.pathname === '/api/orders',
        (route) => {
          if (route.request().method() === 'POST') {
            route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(createdOrder) });
          } else if (route.request().method() === 'GET') {
            route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                orders: [createdOrder],
                pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
              }),
            });
          } else {
            route.continue();
          }
        }
      );

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
