import { Page, Locator } from '@playwright/test';

export class OrdersPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly orderCards: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByTestId('orders-title');
    this.orderCards = page.locator('.order-card');
    this.emptyState = page.locator('.orders-empty p');
  }

  async navigate() {
    await this.page.goto('/orders');
    await this.waitForLoaded();
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
}
