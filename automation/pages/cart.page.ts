import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly checkoutButton: Locator;
  readonly cartTitle: Locator;
  readonly emptyCartMessage: Locator;
  readonly cartItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.getByRole('button', { name: 'Thanh toán ngay' });
    this.cartTitle = page.locator('.cart-title');
    this.emptyCartMessage = page.locator('.cart-empty p');
    this.cartItems = page.locator('.cart-item');
  }

  async navigate() {
    await this.page.goto('/cart');
  }

  async clickCheckout() {
    await this.checkoutButton.click();
  }

  async getItemCount(): Promise<number> {
    return this.cartItems.count();
  }
}
