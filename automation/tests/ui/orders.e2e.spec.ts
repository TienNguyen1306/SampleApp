/**
 * E2E tests for Order History — NO MOCKS.
 * All API calls go through the real backend (localhost:3001 via Vite proxy).
 *
 * Setup (beforeAll):
 *   - Creates a dedicated test user via admin API
 *   - Places 3 orders (mix of cash/card) via API on behalf of that user
 *
 * Teardown (afterAll):
 *   - Deletes the test user
 *
 * All tests run serially so they share consistent DB state.
 */

import { test, expect } from '@playwright/test';
import * as auth from '../../api-services/auth.service.js';
import * as order from '../../api-services/order.service.js';
import * as user from '../../api-services/user.service.js';
import { LoginPage } from '../../pages/login.page';
import { OrdersPage } from '../../pages/orders.page';

const ORDERS: {
  recipientName: string;
  address: string;
  paymentMethod: 'cash' | 'card';
}[] = [
  { recipientName: 'Nguyễn E2E A', address: '1 Đường Lê Lợi, TP. HCM',       paymentMethod: 'cash' },
  { recipientName: 'Trần E2E B',   address: '2 Đường Nguyễn Huệ, TP. HCM',    paymentMethod: 'card' },
  { recipientName: 'Lê E2E C',     address: '3 Đường Trần Hưng Đạo, TP. HCM', paymentMethod: 'cash' },
];

test.describe('E2E - Order History (no mocks)', () => {
  test.describe.configure({ mode: 'serial' });

  let adminToken: string;
  let userToken: string;
  let testUserId: string;
  const testUsername = `e2e_orders_${Date.now()}`;

  // ── Setup ────────────────────────────────────────────────────────────────
  test.beforeAll(async () => {
    // 1. Get admin token
    const adminLogin = await auth.login('admin', 'password123');
    adminToken = adminLogin.token;

    // 2. Create dedicated test user
    const newUser = await user.createUser(adminToken, {
      username: testUsername,
      password: 'password123',
      name: 'E2E Orders User',
    });
    testUserId = newUser._id;

    // 3. Login as test user
    const userLogin = await auth.login(testUsername, 'password123');
    userToken = userLogin.token;

    // 4. Place 3 orders via API
    for (const o of ORDERS) {
      await order.placeOrder(userToken, {
        items: [{ productId: '000000000000000000000001', name: 'Test Product', price: 100000, emoji: '📦', quantity: 1 }],
        recipientName: o.recipientName,
        recipientPhone: '0912345678',
        address: o.address,
        paymentMethod: o.paymentMethod,
        totalPrice: 100000,
      });
    }
  });

  // ── Teardown ─────────────────────────────────────────────────────────────
  test.afterAll(async () => {
    if (!testUserId) return;
    // Re-login as admin (token may have expired after long test run)
    const freshAdmin = await auth.login('admin', 'password123');
    await user.deleteUsers(freshAdmin.token, [testUserId]);
  });

  // ── Per-test: log in as test user and go to /orders ──────────────────────
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(testUsername, 'password123');
    await page.waitForURL('**/home');
  });

  // ── Tests ────────────────────────────────────────────────────────────────

  test('should display all 3 orders placed by the user', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.navigate();

    await ordersPage.assertOrderCount(3);
    await ordersPage.assertPageTitleVisible();
  });

  test('should show correct order details for each order', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.navigate();

    // Orders are sorted newest-first; order 3 (Lê E2E C) should be first
    await expect(ordersPage.getOrderStatus(0)).toContainText('Đã xác nhận');
    await expect(ordersPage.getOrderRecipient(0)).toContainText('Lê E2E C');
    await expect(ordersPage.getOrderRecipient(1)).toContainText('Trần E2E B');
    await expect(ordersPage.getOrderRecipient(2)).toContainText('Nguyễn E2E A');
  });

  test('should search orders by recipient name', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.navigate();
    await ordersPage.assertOrderCount(3);

    await ordersPage.search('Nguyễn E2E');

    await ordersPage.assertOrderCount(1);
    await expect(ordersPage.getOrderRecipient(0)).toContainText('Nguyễn E2E A');
  });

  test('should search orders by address', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.navigate();

    await ordersPage.search('Nguyễn Huệ');

    await ordersPage.assertOrderCount(1);
    await expect(ordersPage.getOrderRecipient(0)).toContainText('Trần E2E B');
  });

  test('should show no-results message when search has no matches', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.navigate();

    await ordersPage.search('xyz_không_tồn_tại_12345');

    await ordersPage.assertOrderCount(0);
    await expect(ordersPage.emptyState).toContainText('Không tìm thấy đơn hàng phù hợp');
  });

  test('should filter by payment method — cash returns 2 orders', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.navigate();
    await ordersPage.assertOrderCount(3);

    await ordersPage.filterByPayment('cash');

    await ordersPage.assertOrderCount(2);
    for (let i = 0; i < 2; i++) {
      await expect(ordersPage.getOrderPayment(i)).toContainText('Tiền mặt');
    }
  });

  test('should filter by payment method — card returns 1 order', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.navigate();

    await ordersPage.filterByPayment('card');

    await ordersPage.assertOrderCount(1);
    await expect(ordersPage.getOrderPayment(0)).toContainText('Thẻ');
    await expect(ordersPage.getOrderRecipient(0)).toContainText('Trần E2E B');
  });

  test('should filter by confirmed status', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.navigate();

    await ordersPage.filterByStatus('confirmed');

    // All 3 orders are confirmed
    await ordersPage.assertOrderCount(3);
  });

  test('should combine search and payment filter', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.navigate();

    await ordersPage.filterByPayment('cash');
    await ordersPage.assertOrderCount(2);

    await ordersPage.search('Nguyễn E2E');
    await ordersPage.assertOrderCount(1);
    await expect(ordersPage.getOrderRecipient(0)).toContainText('Nguyễn E2E A');
  });

  test('should delete an order and remove it from the list', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.navigate();
    await ordersPage.assertOrderCount(3);

    // Delete the first order (newest — Lê E2E C)
    await ordersPage.clickDeleteOnCard(0);
    await ordersPage.assertDeleteModalVisible();
    await ordersPage.confirmDelete();

    // One less order
    await ordersPage.assertOrderCount(2);
    // Lê E2E C should no longer appear
    const remaining = await page.locator('.order-recipient').allInnerTexts();
    expect(remaining.every((t) => !t.includes('Lê E2E C'))).toBe(true);
  });

  test('should cancel delete and keep order in list', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.navigate();
    // After previous test deleted 1 order, we now have 2
    await ordersPage.assertOrderCount(2);

    await ordersPage.clickDeleteOnCard(0);
    await ordersPage.assertDeleteModalVisible();
    await ordersPage.cancelDelete();

    // Still 2 orders
    await ordersPage.assertDeleteModalHidden();
    await ordersPage.assertOrderCount(2);
  });

  test('should show pagination when page size is reduced below order count', async ({ page }) => {
    // 2 orders remain after the delete test; place 4 more so we have 6 total.
    // With page size 5 that gives 2 pages (5 on page 1, 1 on page 2).
    for (let i = 0; i < 4; i++) {
      await order.placeOrder(userToken, {
        items: [{ productId: '000000000000000000000001', name: 'Test Product', price: 100000, emoji: '📦', quantity: 1 }],
        recipientName: `Pagination User ${i + 1}`,
        recipientPhone: '0912345678',
        address: `${i + 1} Đường Test`,
        paymentMethod: 'cash',
        totalPrice: 100000,
      });
    }

    const ordersPage = new OrdersPage(page);
    await ordersPage.navigate();

    // Change page size to 5 — 6 total orders → 2 pages (5 + 1)
    await page.getByTestId('orders-page-size').selectOption('5');
    await page.waitForLoadState('networkidle');

    await ordersPage.assertOrderCount(5);
    await ordersPage.assertPaginationVisible();
    await ordersPage.assertPrevButtonDisabled();

    await ordersPage.goToNextPage();
    await ordersPage.assertOrderCount(1);
    await ordersPage.assertNextButtonDisabled();
  });

  test('should delete all displayed orders via delete-all button', async ({ page }) => {
    // At this point pagination test left orders in DB; start fresh by placing 2 new cash orders
    const cashItems = [{ productId: '000000000000000000000001', name: 'Áo thun', price: 199000, emoji: '👕', quantity: 1 }];
    await order.placeOrder(userToken, { items: cashItems, recipientName: 'Del All A', recipientPhone: '0911000001', address: '1 Đường Xoá', paymentMethod: 'cash', totalPrice: 199000 });
    await order.placeOrder(userToken, { items: cashItems, recipientName: 'Del All B', recipientPhone: '0911000002', address: '2 Đường Xoá', paymentMethod: 'cash', totalPrice: 199000 });

    const ordersPage = new OrdersPage(page);
    await ordersPage.navigate();

    // There should be at least 2 orders
    const countBefore = await ordersPage.getOrderCount();
    expect(countBefore).toBeGreaterThanOrEqual(2);

    // Register dialog handler early so alert() after deletion is caught
    page.on('dialog', (dialog) => dialog.accept());

    // Click delete-all and confirm
    await ordersPage.assertDeleteAllButtonVisible();
    await ordersPage.clickDeleteAll();
    await ordersPage.assertDeleteAllModalVisible();
    await ordersPage.confirmDeleteAll();

    // All orders should be gone
    await ordersPage.assertOrderCount(0);
  });

  test('should delete only filtered orders when filter is active', async ({ page }) => {
    // Place 2 cash + 1 card orders so we can filter
    const items = [{ productId: '000000000000000000000001', name: 'Sản phẩm', price: 100000, emoji: '📦', quantity: 1 }];
    await order.placeOrder(userToken, { items, recipientName: 'Filter Cash A', recipientPhone: '0912000001', address: '1 Đường Filter', paymentMethod: 'cash', totalPrice: 100000 });
    await order.placeOrder(userToken, { items, recipientName: 'Filter Cash B', recipientPhone: '0912000002', address: '2 Đường Filter', paymentMethod: 'cash', totalPrice: 100000 });
    await order.placeOrder(userToken, { items, recipientName: 'Filter Card C', recipientPhone: '0912000003', address: '3 Đường Filter', paymentMethod: 'card', paymentIntentId: 'mock_pi', totalPrice: 100000 });

    const ordersPage = new OrdersPage(page);
    await ordersPage.navigate();

    // Filter to card payment — only 1 order shown
    await ordersPage.filterByPayment('card');
    await ordersPage.assertOrderCount(1);

    // Register dialog handler early so alert() after deletion is caught
    page.on('dialog', (dialog) => dialog.accept());

    // Delete all (only the filtered card order)
    await ordersPage.clickDeleteAll();
    await ordersPage.assertDeleteAllModalVisible();
    await ordersPage.confirmDeleteAll();

    // Wait for card orders to be gone (still in card filter view)
    await expect(ordersPage.orderCards).toHaveCount(0, { timeout: 10000 });

    // After removing card filter, 2 cash orders should remain
    await ordersPage.filterByPayment('');
    await expect(ordersPage.orderCards).toHaveCount(2, { timeout: 10000 });
  });
});
