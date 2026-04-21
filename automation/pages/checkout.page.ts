import { Page, Locator, expect } from '@playwright/test';
import { HomePage } from './home.page';

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

  async waitForCheckout() {
    await this.page.waitForURL('**/checkout');
  }

  async fillForm(data: CheckoutFormData) {
    await this.recipientNameInput.fill(data.recipientName);
    await this.recipientPhoneInput.fill(data.recipientPhone);
    await this.addressInput.fill(data.address);
  }

  async fillFormPartial(data: Partial<CheckoutFormData>) {
    if (data.recipientName) await this.recipientNameInput.fill(data.recipientName);
    if (data.recipientPhone) await this.recipientPhoneInput.fill(data.recipientPhone);
    if (data.address) await this.addressInput.fill(data.address);
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

  /**
   * Sets up a request listener to track whether the payment-intent API was called.
   * Call this before triggering the action, then use assertPaymentIntentWasCalled / assertPaymentIntentNotCalled.
   */
  trackPaymentIntentRequests(): { wasCalled: () => boolean } {
    let called = false;
    this.page.on('request', (req) => {
      if (req.url().includes('/api/orders/payment-intent')) called = true;
    });
    return { wasCalled: () => called };
  }

  /**
   * Intercepts POST /api/orders and captures the request payload.
   * Returns a getter function — call it after the form is submitted to retrieve the payload.
   */
  async setupOrderPostCapture(
    mockResponse: Record<string, unknown>,
    _ordersApiUrl: string
  ): Promise<() => Record<string, unknown> | null> {
    let capturedBody: Record<string, unknown> | null = null;
    // Use pathname matching so the route works regardless of whether the request
    // goes through the Vite dev proxy (localhost:5173) or directly to the backend
    // (localhost:3001). The URL string passed by the caller is intentionally ignored.
    await this.page.route(
      (url: URL) => url.pathname === '/api/orders',
      async (route) => {
        if (route.request().method() === 'POST') {
          capturedBody = route.request().postDataJSON();
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify(mockResponse),
          });
        } else {
          await route.continue();
        }
      }
    );
    return () => capturedBody;
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async assertOnCart() {
    await expect(this.page).toHaveURL(/\/cart/);
  }

  async assertOnCheckout() {
    await expect(this.page).toHaveURL(/\/checkout/);
  }

  async assertOnHome() {
    await expect(this.page).toHaveURL(/\/home/);
  }

  async assertFormVisible() {
    await expect(this.recipientNameInput).toBeVisible();
    await expect(this.recipientPhoneInput).toBeVisible();
    await expect(this.addressInput).toBeVisible();
    await expect(this.cashOption).toBeVisible();
    await expect(this.cardOption).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async assertSuccess() {
    await expect(this.successHeading).toBeVisible();
  }

  async assertNotSuccess() {
    await expect(this.successHeading).not.toBeVisible();
  }

  async assertSuccessOrderIdHasHash() {
    await expect(this.successOrderId).toContainText('#');
  }

  async assertSuccessContains(text: string) {
    await expect(this.successContainer).toContainText(text);
  }

  async assertSuccessTotal(text: string) {
    await expect(this.successTotal).toContainText(text);
  }

  async assertCardElementVisible() {
    await expect(this.cardElementContainer).toBeVisible();
  }

  async assertCardElementNotVisible() {
    await expect(this.cardElementContainer).not.toBeVisible();
  }

  async assertCardHintVisible() {
    await expect(this.cardHint).toBeVisible();
  }

  async assertOrderSummaryVisible() {
    await expect(this.orderSummary).toBeVisible();
  }

  async assertSummaryItemCount(n: number) {
    await expect(this.summaryItems).toHaveCount(n);
  }

  async assertCartBadgeGone() {
    const homePage = new HomePage(this.page);
    await homePage.assertCartBadgeNotVisible();
  }

  assertPaymentIntentWasCalled(tracker: { wasCalled: () => boolean }) {
    expect(tracker.wasCalled()).toBe(true);
  }

  assertPaymentIntentNotCalled(tracker: { wasCalled: () => boolean }) {
    expect(tracker.wasCalled()).toBe(false);
  }

  assertOrderPayload(
    getPayload: () => Record<string, unknown> | null,
    expected: {
      recipientName?: string;
      recipientPhone?: string;
      paymentMethod?: string;
      hasItems?: boolean;
      totalPricePositive?: boolean;
    }
  ) {
    const payload = getPayload();
    expect(payload).not.toBeNull();
    if (expected.recipientName) expect(payload!['recipientName']).toBe(expected.recipientName);
    if (expected.recipientPhone) expect(payload!['recipientPhone']).toBe(expected.recipientPhone);
    if (expected.paymentMethod) expect(payload!['paymentMethod']).toBe(expected.paymentMethod);
    if (expected.hasItems) expect(payload!['items']).toBeDefined();
    if (expected.totalPricePositive) expect(payload!['totalPrice'] as number).toBeGreaterThan(0);
  }
}
