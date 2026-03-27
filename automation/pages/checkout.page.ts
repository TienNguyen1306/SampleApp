import { Page, Locator } from '@playwright/test';

export interface CheckoutFormData {
  recipientName: string;
  recipientPhone: string;
  address: string;
}

export class CheckoutPage {
  readonly page: Page;
  readonly recipientNameInput: Locator;
  readonly recipientPhoneInput: Locator;
  readonly addressInput: Locator;
  readonly cashOption: Locator;
  readonly cardOption: Locator;
  readonly submitButton: Locator;
  readonly backButton: Locator;
  readonly orderSummary: Locator;
  readonly summaryItems: Locator;
  readonly cardElementContainer: Locator;
  readonly cardHint: Locator;
  readonly successHeading: Locator;
  readonly successOrderId: Locator;
  readonly successContainer: Locator;
  readonly successTotal: Locator;
  readonly continueShopping: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.recipientNameInput = page.getByTestId('checkout-name');
    this.recipientPhoneInput = page.getByTestId('checkout-phone');
    this.addressInput = page.getByTestId('checkout-address');
    this.cashOption = page.locator('.payment-option').filter({ hasText: 'COD' });
    this.cardOption = page.locator('.payment-option').filter({ hasText: 'Stripe' });
    this.submitButton = page.getByTestId('checkout-submit');
    this.backButton = page.getByTestId('checkout-back');
    this.orderSummary = page.locator('.order-summary');
    this.summaryItems = page.locator('.summary-item');
    this.cardElementContainer = page.locator('.card-element-container');
    this.cardHint = page.locator('.card-hint');
    this.successHeading = page.getByTestId('checkout-success-heading');
    this.successOrderId = page.locator('.checkout-success').getByText(/Mã đơn hàng/);
    this.successContainer = page.locator('.checkout-success');
    this.successTotal = page.locator('.success-total');
    this.continueShopping = page.getByTestId('checkout-continue');
    this.errorMessage = page.locator('.checkout-error');
  }

  async navigate() {
    await this.page.goto('/checkout');
  }

  async fillForm(data: CheckoutFormData) {
    await this.recipientNameInput.fill(data.recipientName);
    await this.recipientPhoneInput.fill(data.recipientPhone);
    await this.addressInput.fill(data.address);
  }

  async selectPaymentMethod(method: 'cash' | 'card') {
    if (method === 'cash') {
      await this.cashOption.click();
    } else {
      await this.cardOption.click();
    }
  }

  async submit() {
    await this.submitButton.click();
  }

  async clickBack() {
    await this.backButton.click();
  }

  async clickContinueShopping() {
    await this.continueShopping.click();
  }

  async isSuccess(): Promise<boolean> {
    return this.successHeading.isVisible();
  }

  async getSuccessOrderId(): Promise<string> {
    const text = await this.successOrderId.innerText();
    const match = text.match(/#([a-fA-F0-9]+)/);
    return match ? match[1] : '';
  }
}
