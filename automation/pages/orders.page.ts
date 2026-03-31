import { Page, Locator, expect } from '@playwright/test';

export class OrdersPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly orderCards: Locator;
  readonly emptyState: Locator;
  readonly shopNowButton: Locator;
  readonly backButton: Locator;
  readonly ordersNavButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByTestId('orders-title');
    this.orderCards = page.locator('.order-card');
    this.emptyState = page.locator('.orders-empty p');
    this.shopNowButton = page.getByRole('button', { name: 'Mua sắm ngay' });
    this.backButton = page.getByRole('button', { name: '← Trang chủ' });
    this.ordersNavButton = page.getByRole('button', { name: '📦 Đơn hàng' });
  }

  async navigate() {
    await this.page.goto('/orders');
    await this.waitForLoaded();
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
    await this.page.route(ordersApiUrl, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(orders) })
    );
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
}
