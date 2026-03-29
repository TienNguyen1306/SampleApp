import { test, expect } from '../../fixtures/checkout.fixture';
import { checkoutScenarios, incompleteFormScenarios, mockOrder } from '../../data/checkout.data';
import { HomePage } from '../../pages/home.page';

const ORDERS_API_URL = 'http://localhost:3001/api/orders';

test.describe('Checkout Page', () => {

  test.describe('Navigation', () => {
    test('should navigate to checkout when clicking "Thanh toán ngay" from cart', async ({ cartWithItemsPage }) => {
      await cartWithItemsPage.clickCheckout();
      await expect(cartWithItemsPage.page).toHaveURL(/\/checkout/);
    });

    test('should redirect to cart when accessing checkout with empty cart', async ({ cartPage }) => {
      await cartPage.navigate();
      await cartPage.page.goto('/checkout');
      await expect(cartPage.page).toHaveURL(/\/cart/);
    });

    test('should navigate back to cart when clicking back button', async ({ checkoutPage }) => {
      await checkoutPage.clickBack();
      await expect(checkoutPage.page).toHaveURL(/\/cart/);
    });
  });

  test.describe('Form validation', () => {
    for (const scenario of incompleteFormScenarios) {
      test(`should not submit with ${scenario.description}`, async ({ checkoutPage }) => {
        if (scenario.recipientName) await checkoutPage.recipientNameInput.fill(scenario.recipientName);
        if (scenario.recipientPhone) await checkoutPage.recipientPhoneInput.fill(scenario.recipientPhone);
        if (scenario.address) await checkoutPage.addressInput.fill(scenario.address);

        await checkoutPage.submit();

        await expect(checkoutPage.successHeading).not.toBeVisible();
        await expect(checkoutPage.page).toHaveURL(/\/checkout/);
      });
    }
  });

  test.describe('Checkout form', () => {
    test('should display all form sections', async ({ checkoutPage }) => {
      await expect(checkoutPage.recipientNameInput).toBeVisible();
      await expect(checkoutPage.recipientPhoneInput).toBeVisible();
      await expect(checkoutPage.addressInput).toBeVisible();
      await expect(checkoutPage.cashOption).toBeVisible();
      await expect(checkoutPage.cardOption).toBeVisible();
      await expect(checkoutPage.submitButton).toBeVisible();
    });

    test('should show order summary with items in sidebar', async ({ checkoutPage }) => {
      await expect(checkoutPage.orderSummary).toBeVisible();
      await expect(checkoutPage.summaryItems).toHaveCount(1);
    });

    test('should show Stripe card element when card payment selected', async ({ checkoutPage }) => {
      await checkoutPage.selectPaymentMethod('card');
      await expect(checkoutPage.cardElementContainer).toBeVisible();
      await expect(checkoutPage.cardHint).toBeVisible();
    });

    test('should hide Stripe card element when cash payment selected', async ({ checkoutPage }) => {
      await checkoutPage.selectPaymentMethod('card');
      await checkoutPage.selectPaymentMethod('cash');
      await expect(checkoutPage.cardElementContainer).not.toBeVisible();
    });
  });

  test.describe('Payment flow - data driven', () => {
    for (const scenario of checkoutScenarios) {
      test(`should complete order with ${scenario.description}`, async ({ checkoutPage, mockOrdersApi }) => {
        await mockOrdersApi({
          ...mockOrder,
          recipientName: scenario.recipientName,
          recipientPhone: scenario.recipientPhone,
          address: scenario.address,
          paymentMethod: scenario.paymentMethod,
        });

        await checkoutPage.fillForm({
          recipientName: scenario.recipientName,
          recipientPhone: scenario.recipientPhone,
          address: scenario.address,
        });
        await checkoutPage.selectPaymentMethod(scenario.paymentMethod);
        await checkoutPage.submit();

        await expect(checkoutPage.successHeading).toBeVisible();
        await expect(checkoutPage.successOrderId).toContainText('#');
      });
    }
  });

  test.describe('Cash payment', () => {
    test('should display success with order details after cash payment', async ({ checkoutPage, mockOrdersApi }) => {
      await mockOrdersApi(mockOrder);

      await checkoutPage.fillForm({
        recipientName: 'Nguyễn Văn A',
        recipientPhone: '0912345678',
        address: '123 Đường Lê Lợi, TP. HCM',
      });
      await checkoutPage.selectPaymentMethod('cash');
      await checkoutPage.submit();

      await expect(checkoutPage.successHeading).toBeVisible();
      await expect(checkoutPage.successContainer).toContainText('Nguyễn Văn A');
      await expect(checkoutPage.successContainer).toContainText('Tiền mặt');
    });

    test('should show correct total price in success screen', async ({ checkoutPage, mockOrdersApi }) => {
      await mockOrdersApi(mockOrder);

      await checkoutPage.fillForm({
        recipientName: 'Nguyễn Văn A',
        recipientPhone: '0912345678',
        address: '123 Đường Lê Lợi, TP. HCM',
      });
      await checkoutPage.submit();

      await expect(checkoutPage.successTotal).toContainText('199.000đ');
    });
  });

  test.describe('Card payment (mock mode)', () => {
    test('should complete card payment without real Stripe key', async ({ checkoutPage, mockOrdersApi }) => {
      await mockOrdersApi({ ...mockOrder, paymentMethod: 'card', paymentIntentId: 'mock_pi_123_secret_mock' });

      await checkoutPage.fillForm({
        recipientName: 'Trần Thị B',
        recipientPhone: '0987654321',
        address: '456 Đường Nguyễn Huệ, TP. HCM',
      });
      await checkoutPage.selectPaymentMethod('card');
      await checkoutPage.submit();

      await expect(checkoutPage.successHeading).toBeVisible();
      await expect(checkoutPage.successContainer).toContainText('Thẻ');
    });

    test('should call payment-intent API when card payment selected', async ({ checkoutPage, mockOrdersApi }) => {
      await mockOrdersApi({ ...mockOrder, paymentMethod: 'card' });

      let paymentIntentCalled = false;
      checkoutPage.page.on('request', (req) => {
        if (req.url().includes('/api/orders/payment-intent')) paymentIntentCalled = true;
      });

      await checkoutPage.fillForm({
        recipientName: 'Trần Thị B',
        recipientPhone: '0987654321',
        address: '456 Đường Nguyễn Huệ, TP. HCM',
      });
      await checkoutPage.selectPaymentMethod('card');
      await checkoutPage.submit();

      expect(paymentIntentCalled).toBe(true);
    });

    test('should NOT call payment-intent API when cash payment selected', async ({ checkoutPage, mockOrdersApi }) => {
      await mockOrdersApi(mockOrder);

      let paymentIntentCalled = false;
      checkoutPage.page.on('request', (req) => {
        if (req.url().includes('/api/orders/payment-intent')) paymentIntentCalled = true;
      });

      await checkoutPage.fillForm({
        recipientName: 'Nguyễn Văn A',
        recipientPhone: '0912345678',
        address: '123 Đường Lê Lợi, TP. HCM',
      });
      await checkoutPage.selectPaymentMethod('cash');
      await checkoutPage.submit();

      expect(paymentIntentCalled).toBe(false);
    });
  });

  test.describe('Post-payment behaviour', () => {
    test('should clear cart after successful payment', async ({ checkoutPage, mockOrdersApi }) => {
      await mockOrdersApi(mockOrder);

      await checkoutPage.fillForm({
        recipientName: 'Nguyễn Văn A',
        recipientPhone: '0912345678',
        address: '123 Đường Lê Lợi, TP. HCM',
      });
      await checkoutPage.submit();

      await expect(checkoutPage.successHeading).toBeVisible();
      await checkoutPage.clickContinueShopping();
      await expect(checkoutPage.page).toHaveURL(/\/home/);

      const homePage = new HomePage(checkoutPage.page);
      await expect(homePage.cartBadge).not.toBeVisible();
    });

    test('should navigate to home when clicking "Tiếp tục mua sắm"', async ({ checkoutPage, mockOrdersApi }) => {
      await mockOrdersApi(mockOrder);

      await checkoutPage.fillForm({
        recipientName: 'Nguyễn Văn A',
        recipientPhone: '0912345678',
        address: '123 Đường Lê Lợi, TP. HCM',
      });
      await checkoutPage.submit();

      await checkoutPage.clickContinueShopping();
      await expect(checkoutPage.page).toHaveURL(/\/home/);
    });

    test('should call POST /api/orders with correct payload', async ({ checkoutPage }) => {
      let capturedBody: Record<string, unknown> | null = null;
      await checkoutPage.page.route(ORDERS_API_URL, async (route) => {
        if (route.request().method() === 'POST') {
          capturedBody = route.request().postDataJSON();
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify(mockOrder),
          });
        } else {
          await route.continue();
        }
      });

      await checkoutPage.fillForm({
        recipientName: 'Nguyễn Văn A',
        recipientPhone: '0912345678',
        address: '123 Đường Lê Lợi, TP. HCM',
      });
      await checkoutPage.selectPaymentMethod('cash');
      await checkoutPage.submit();

      expect(capturedBody).not.toBeNull();
      expect(capturedBody!['recipientName']).toBe('Nguyễn Văn A');
      expect(capturedBody!['recipientPhone']).toBe('0912345678');
      expect(capturedBody!['paymentMethod']).toBe('cash');
      expect(capturedBody!['items']).toBeDefined();
      expect(capturedBody!['totalPrice']).toBeGreaterThan(0);
    });
  });

});
