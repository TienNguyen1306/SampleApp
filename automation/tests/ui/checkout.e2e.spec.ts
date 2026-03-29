import { test, expect } from '../../fixtures/checkout.e2e.fixture';
import { e2eCheckoutScenarios } from '../../data/checkout.data';

/**
 * E2E tests - no mocks, hits real backend (localhost:3001) and frontend (localhost:5173)
 * Prerequisites: both servers must be running
 */
test.describe('E2E - Cash Payment (no mock)', () => {

  for (const scenario of e2eCheckoutScenarios) {
    test(`should complete order for ${scenario.description}`, async ({
      page,
      loginPage,
      homePage,
      cartPage,
      checkoutPage,
      ordersPage,
    }) => {
      // 1. Login with real credentials
      await loginPage.navigate();
      await loginPage.login(scenario.credentials.username, scenario.credentials.password);
      await page.waitForURL('**/home');

      // 2. Add first product to cart and navigate to cart via SPA
      await homePage.addFirstProductToCart();
      await homePage.clickCart();

      // 3. Proceed to checkout
      await cartPage.clickCheckout();
      await page.waitForURL('**/checkout');

      // 4. Fill in form and submit
      await checkoutPage.fillForm({
        recipientName: scenario.recipientName,
        recipientPhone: scenario.recipientPhone,
        address: scenario.address,
      });
      await checkoutPage.selectPaymentMethod(scenario.paymentMethod);
      await checkoutPage.submit();

      // 5. Verify success screen
      await expect(checkoutPage.successHeading).toBeVisible();
      await expect(checkoutPage.successOrderId).toContainText('#');
      await expect(checkoutPage.successContainer).toContainText(scenario.recipientName);
      await expect(checkoutPage.successContainer).toContainText(scenario.expectedPaymentLabel);

      // 6. Navigate to orders page via SPA (preserve sessionStorage) and verify order persisted
      const orderId = await checkoutPage.getSuccessOrderId();
      await checkoutPage.clickContinueShopping();
      await page.waitForURL('**/home');
      await homePage.clickOrders();

      await expect(ordersPage.pageTitle).toBeVisible();
      await expect(ordersPage.getOrderById(orderId)).toBeVisible();
      await expect(ordersPage.getOrderById(orderId)).toContainText(scenario.recipientName);
      await expect(ordersPage.getOrderById(orderId)).toContainText(scenario.expectedPaymentLabel);
    });
  }

});
