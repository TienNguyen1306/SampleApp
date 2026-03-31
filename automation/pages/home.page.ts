import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly logoutButton: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeMessage = page.locator('strong').filter({ hasText: /Admin User|Nguyễn Văn A/ }).first();
    this.logoutButton = page.getByTestId('logout-btn');
    this.cartBadge = page.locator('.cart-badge');
  }

  async navigate() {
    await this.page.goto('/home');
    await this.page.waitForLoadState('networkidle');
  }

  async isLoggedIn(): Promise<boolean> {
    return this.logoutButton.isVisible();
  }

  async getWelcomeText(): Promise<string> {
    return this.welcomeMessage.innerText();
  }

  async addFirstProductToCart() {
    await this.page.waitForSelector('.product-card');
    await this.page.locator('.add-to-cart').first().click();
  }

  async clickCart() {
    await this.page.locator('.cart-btn').click();
    await this.page.waitForURL('**/cart');
  }

  async clickOrders() {
    await this.page.locator('.orders-btn').click();
    await this.page.waitForURL('**/orders');
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async assertIsLoggedIn() {
    await expect(this.logoutButton).toBeVisible();
  }

  async assertWelcomeText(name: string) {
    await expect(this.welcomeMessage).toContainText(name);
  }

  async assertCartBadgeNotVisible() {
    await expect(this.cartBadge).not.toBeVisible();
  }
}
