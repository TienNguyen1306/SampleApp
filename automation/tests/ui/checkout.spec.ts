import { test, expect } from '../../fixtures/checkout.fixture';
import { checkoutScenarios, incompleteFormScenarios, mockOrder } from '../../data/checkout.data';

const ORDERS_API_URL = 'http://localhost:3001/api/orders';

test.describe('Checkout Page', () => {

  test.describe('Navigation', () => {
    test('should navigate to checkout when clicking "Thanh toán ngay" from cart', async ({ cartWithItemsPage }) => {
      await cartWithItemsPage.clickCheckout();
      await cartWithItemsPage.assertOnCheckout();
    });

    test('should redirect to cart when accessing checkout with empty cart', async ({ cartPage }) => {
      await cartPage.navigate();
      await cartPage.navigateToCheckout();
      await cartPage.assertOnCart();
    });

    test('should navigate back to cart when clicking back button', async ({ checkoutPage }) => {
      await checkoutPage.clickBack();
      await checkoutPage.assertOnCart();
    });
  });

  test.describe('Form validation', () => {
    for (const scenario of incompleteFormScenarios) {
      test(`should not submit with ${scenario.description}`, async ({ checkoutPage }) => {
        await checkoutPage.fillFormPartial({
          recipientName: scenario.recipientName,
          recipientPhone: scenario.recipientPhone,
          address: scenario.address,
        });

        await checkoutPage.submit();

        await checkoutPage.assertNotSuccess();
        await checkoutPage.assertOnCheckout();
      });
    }
  });

  test.describe('Checkout form', () => {
    test('should display all form sections', async ({ checkoutPage }) => {
      await checkoutPage.assertFormVisible();
    });

    test('should show order summary with items in sidebar', async ({ checkoutPage }) => {
      await checkoutPage.assertOrderSummaryVisible();
      await checkoutPage.assertSummaryItemCount(1);
    });

    test('should show Stripe card element when card payment selected', async ({ checkoutPage }) => {
      await checkoutPage.selectPaymentMethod('card');
      await checkoutPage.assertCardElementVisible();
      await checkoutPage.assertCardHintVisible();
    });

    test('should hide Stripe card element when cash payment selected', async ({ checkoutPage }) => {
      await checkoutPage.selectPaymentMethod('card');
      await checkoutPage.selectPaymentMethod('cash');
      await checkoutPage.assertCardElementNotVisible();
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

        await checkoutPage.assertSuccess();
        await checkoutPage.assertSuccessOrderIdHasHash();
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

      await checkoutPage.assertSuccess();
      await checkoutPage.assertSuccessContains('Nguyễn Văn A');
      await checkoutPage.assertSuccessContains('Tiền mặt');
    });

    test('should show correct total price in success screen', async ({ checkoutPage, mockOrdersApi }) => {
      await mockOrdersApi(mockOrder);

      await checkoutPage.fillForm({
        recipientName: 'Nguyễn Văn A',
        recipientPhone: '0912345678',
        address: '123 Đường Lê Lợi, TP. HCM',
      });
      await checkoutPage.submit();

      await checkoutPage.assertSuccessTotal('199.000đ');
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

      await checkoutPage.assertSuccess();
      await checkoutPage.assertSuccessContains('Thẻ');
    });

    test('should call payment-intent API when card payment selected', async ({ checkoutPage, mockOrdersApi }) => {
      await mockOrdersApi({ ...mockOrder, paymentMethod: 'card' });

      const tracker = checkoutPage.trackPaymentIntentRequests();

      await checkoutPage.fillForm({
        recipientName: 'Trần Thị B',
        recipientPhone: '0987654321',
        address: '456 Đường Nguyễn Huệ, TP. HCM',
      });
      await checkoutPage.selectPaymentMethod('card');
      await checkoutPage.submit();

      checkoutPage.assertPaymentIntentWasCalled(tracker);
    });

    test('should NOT call payment-intent API when cash payment selected', async ({ checkoutPage, mockOrdersApi }) => {
      await mockOrdersApi(mockOrder);

      const tracker = checkoutPage.trackPaymentIntentRequests();

      await checkoutPage.fillForm({
        recipientName: 'Nguyễn Văn A',
        recipientPhone: '0912345678',
        address: '123 Đường Lê Lợi, TP. HCM',
      });
      await checkoutPage.selectPaymentMethod('cash');
      await checkoutPage.submit();

      checkoutPage.assertPaymentIntentNotCalled(tracker);
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

      await checkoutPage.assertSuccess();
      await checkoutPage.clickContinueShopping();
      await checkoutPage.assertOnHome();
      await checkoutPage.assertCartBadgeGone();
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
      await checkoutPage.assertOnHome();
    });

    test('should call POST /api/orders with correct payload', async ({ checkoutPage }) => {
      const getPayload = await checkoutPage.setupOrderPostCapture(mockOrder, ORDERS_API_URL);

      await checkoutPage.fillForm({
        recipientName: 'Nguyễn Văn A',
        recipientPhone: '0912345678',
        address: '123 Đường Lê Lợi, TP. HCM',
      });
      await checkoutPage.selectPaymentMethod('cash');
      await checkoutPage.submit();

      checkoutPage.assertOrderPayload(getPayload, {
        recipientName: 'Nguyễn Văn A',
        recipientPhone: '0912345678',
        paymentMethod: 'cash',
        hasItems: true,
        totalPricePositive: true,
      });
    });
  });

});
