import { Page, Locator, expect } from '@playwright/test';

export class OrdersPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly orderCards: Locator;
  readonly emptyState: Locator;
  readonly shopNowButton: Locator;
  readonly backButton: Locator;
  readonly ordersNavButton: Locator;

  // Search & Filter
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly statusFilter: Locator;
  readonly paymentFilter: Locator;

  // Pagination
  readonly pagination: Locator;
  readonly prevButton: Locator;
  readonly nextButton: Locator;

  // Delete single
  readonly deleteButtons: Locator;
  readonly confirmDeleteButton: Locator;
  readonly cancelDeleteButton: Locator;

  // Delete all
  readonly deleteAllButton: Locator;
  readonly confirmDeleteAllButton: Locator;
  readonly cancelDeleteAllButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByTestId('orders-title');
    this.orderCards = page.locator('.order-card');
    this.emptyState = page.locator('.orders-empty p');
    this.shopNowButton = page.getByRole('button', { name: 'Mua sắm ngay' });
    this.backButton = page.getByRole('button', { name: '← Trang chủ' });
    this.ordersNavButton = page.getByRole('button', { name: '📦 Đơn hàng' });

    this.searchInput = page.getByTestId('orders-search-input');
    this.searchButton = page.getByTestId('orders-search-btn');
    this.statusFilter = page.getByTestId('orders-filter-status');
    this.paymentFilter = page.getByTestId('orders-filter-payment');

    this.pagination = page.getByTestId('orders-pagination');
    this.prevButton = page.getByTestId('orders-prev-btn');
    this.nextButton = page.getByTestId('orders-next-btn');

    this.deleteButtons = page.getByTestId('order-delete-btn');
    this.confirmDeleteButton = page.getByTestId('confirm-delete-btn');
    this.cancelDeleteButton = page.getByRole('button', { name: 'Hủy' });

    this.deleteAllButton = page.getByTestId('delete-all-btn');
    this.confirmDeleteAllButton = page.getByTestId('confirm-delete-all-btn');
    this.cancelDeleteAllButton = page.getByTestId('cancel-delete-all-btn');
  }

  async navigate() {
    await this.page.goto('/orders');
    await this.page.waitForLoadState('networkidle');
    // Wait for React to render final content: order cards, empty state, or error.
    // networkidle alone can resolve before the state update from the API response is painted.
    await this.page.locator('.order-card, .orders-empty, .orders-state.error').first()
      .waitFor({ timeout: 8000 })
      .catch(() => {
        // No content appeared — leave it to individual test assertions to fail with a clear message.
      });
  }

  async navigateToHome() {
    await this.page.goto('/home');
  }

  async waitForLoaded() {
    await this.page.waitForLoadState('networkidle');
  }

  async getOrderCount(): Promise<number> {
    return this.orderCards.count();
  }

  getOrderCard(index: number): Locator {
    return this.orderCards.nth(index);
  }

  getOrderById(orderId: string): Locator {
    return this.orderCards.filter({
      has: this.page.locator('.order-id').filter({ hasText: new RegExp(`Đơn hàng #${orderId}`) }),
    });
  }

  getOrderItemName(cardIndex: number): Locator {
    return this.orderCards.nth(cardIndex).locator('.order-item-name');
  }

  getOrderItemQty(cardIndex: number): Locator {
    return this.orderCards.nth(cardIndex).locator('.order-item-qty');
  }

  getOrderRecipient(cardIndex: number): Locator {
    return this.orderCards.nth(cardIndex).locator('.order-recipient');
  }

  getOrderPayment(cardIndex: number): Locator {
    return this.orderCards.nth(cardIndex).locator('.order-payment');
  }

  getOrderTotal(cardIndex: number): Locator {
    return this.orderCards.nth(cardIndex).locator('.order-total');
  }

  getOrderStatus(cardIndex: number): Locator {
    return this.orderCards.nth(cardIndex).locator('.order-status');
  }

  async clickShopNow() {
    await this.shopNowButton.click();
  }

  async clickBackButton() {
    await this.backButton.click();
  }

  async clickOrdersNavButton() {
    await this.ordersNavButton.click();
  }

  async setupProductsAndOrdersMock(
    productsApiUrl: string,
    ordersApiUrl: string,
    products: unknown[],
    orders: unknown[]
  ) {
    await this.page.route(productsApiUrl, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(products) })
    );
    await this.page.route(
      (url: URL) => url.pathname === new URL(ordersApiUrl).pathname,
      (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(orders) })
    );
  }

  // ── Search & Filter ───────────────────────────────────────────────────────

  async search(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
    await this.waitForLoaded();
  }

  async searchWithEnter(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.searchInput.press('Enter');
    await this.waitForLoaded();
  }

  async clearSearch() {
    await this.searchInput.clear();
    await this.page.locator('.search-clear-btn').click();
    await this.waitForLoaded();
  }

  async filterByStatus(value: string) {
    await this.statusFilter.selectOption(value);
    await this.waitForLoaded();
  }

  async filterByPayment(value: string) {
    await this.paymentFilter.selectOption(value);
    await this.waitForLoaded();
  }

  // ── Pagination ────────────────────────────────────────────────────────────

  async goToNextPage() {
    await this.nextButton.click();
    await this.waitForLoaded();
  }

  async goToPrevPage() {
    await this.prevButton.click();
    await this.waitForLoaded();
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async clickDeleteOnCard(index: number) {
    await this.deleteButtons.nth(index).click();
  }

  async confirmDelete() {
    await this.confirmDeleteButton.click();
    await this.waitForLoaded();
  }

  async cancelDelete() {
    await this.cancelDeleteButton.click();
  }

  async clickDeleteAll() {
    await this.deleteAllButton.click();
  }

  async confirmDeleteAll() {
    await this.confirmDeleteAllButton.click();
    await this.waitForLoaded();
  }

  async cancelDeleteAll() {
    await this.cancelDeleteAllButton.click();
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async assertOnOrders() {
    await expect(this.page).toHaveURL(/\/orders/);
  }

  async assertOnHome() {
    await expect(this.page).toHaveURL(/\/home/);
  }

  async assertShopNowVisible() {
    await expect(this.shopNowButton).toBeVisible();
  }

  async assertPageTitleVisible() {
    await expect(this.pageTitle).toBeVisible();
  }

  async assertOrderCount(n: number) {
    await expect(this.orderCards).toHaveCount(n);
  }

  async assertOrderCardContains(index: number, text: string) {
    await expect(this.orderCards.nth(index)).toContainText(text);
  }

  async assertPaginationVisible() {
    await expect(this.pagination).toBeVisible();
  }

  async assertPrevButtonDisabled() {
    await expect(this.prevButton).toBeDisabled();
  }

  async assertNextButtonDisabled() {
    await expect(this.nextButton).toBeDisabled();
  }

  async assertDeleteModalVisible() {
    await expect(this.confirmDeleteButton).toBeVisible();
  }

  async assertDeleteModalHidden() {
    await expect(this.confirmDeleteButton).not.toBeVisible();
  }

  async assertDeleteAllButtonVisible() {
    await expect(this.deleteAllButton).toBeVisible();
  }

  async assertDeleteAllButtonHidden() {
    await expect(this.deleteAllButton).not.toBeVisible();
  }

  async assertDeleteAllModalVisible() {
    await expect(this.confirmDeleteAllButton).toBeVisible();
  }

  async assertDeleteAllModalHidden() {
    await expect(this.confirmDeleteAllButton).not.toBeVisible();
  }

  async assertNoResultsVisible() {
    await expect(this.emptyState).toBeVisible();
  }
}
