import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { HomePage } from '../pages/home.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { OrdersPage } from '../pages/orders.page';
import { MockOrderResponse, mockProducts } from '../data/checkout.data';

const LOGIN_API_URL = 'http://localhost:3001/api/auth/login';
const PRODUCTS_API_URL = 'http://localhost:3001/api/products';
const PAYMENT_INTENT_API_URL = 'http://localhost:3001/api/orders/payment-intent';
const ORDERS_API_URL = 'http://localhost:3001/api/orders';

const MOCK_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MzI4NDAwNywiZXhwIjoxNzczODg4ODA3fQ.BQ7Jv5xKfelseHdrcCHzeFtnhN5o0CpCJwqKWJGJcDg';

type CheckoutFixtures = {
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  ordersPage: OrdersPage;
  mockOrdersApi: (response: MockOrderResponse) => Promise<void>;
  mockOrderHistoryApi: (orders: MockOrderResponse[]) => Promise<void>;
  cartWithItemsPage: CartPage;
};

export const test = base.extend<CheckoutFixtures>({

  cartPage: async ({ page }, use) => {
    // Mock login
    await page.route((url: URL) => url.pathname === '/api/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: MOCK_TOKEN,
          user: { id: 1, username: 'admin', name: 'Admin User', role: 'admin' },
        }),
      })
    );
    // Mock products
    await page.route((url: URL) => url.pathname === '/api/products', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProducts),
      })
    );

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('admin', 'password123');
    await page.waitForURL('**/home');
    await page.waitForSelector('.product-card');
    await use(new CartPage(page));
  },

  cartWithItemsPage: async ({ page }, use) => {
    // Mock login
    await page.route((url: URL) => url.pathname === '/api/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: MOCK_TOKEN,
          user: { id: 1, username: 'admin', name: 'Admin User', role: 'admin' },
        }),
      })
    );
    // Mock products
    await page.route((url: URL) => url.pathname === '/api/products', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProducts),
      })
    );

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('admin', 'password123');
    await page.waitForURL('**/home');
    await page.waitForSelector('.product-card');

    // Add first product to cart, then SPA-navigate to cart (preserve React state)
    await page.locator('.add-to-cart').first().click();
    await page.locator('.cart-btn').click();
    await page.waitForURL('**/cart');

    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    // Mock login
    await page.route((url: URL) => url.pathname === '/api/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: MOCK_TOKEN,
          user: { id: 1, username: 'admin', name: 'Admin User', role: 'admin' },
        }),
      })
    );
    // Mock products
    await page.route((url: URL) => url.pathname === '/api/products', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProducts),
      })
    );
    // Mock payment intent
    await page.route((url: URL) => url.pathname === '/api/orders/payment-intent', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ clientSecret: `mock_pi_${Date.now()}_secret_mock` }),
      })
    );

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('admin', 'password123');
    await page.waitForURL('**/home');
    await page.waitForSelector('.product-card');
    // Add to cart, then SPA-navigate to preserve React state
    await page.locator('.add-to-cart').first().click();
    await page.locator('.cart-btn').click();
    await page.waitForURL('**/cart');
    await page.getByRole('button', { name: 'Thanh toán ngay' }).click();
    await page.waitForURL('**/checkout');

    await use(new CheckoutPage(page));
  },

  ordersPage: async ({ page }, use) => {
    // Mock login
    await page.route((url: URL) => url.pathname === '/api/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: MOCK_TOKEN,
          user: { id: 1, username: 'admin', name: 'Admin User', role: 'admin' },
        }),
      })
    );

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('admin', 'password123');
    await page.waitForURL('**/home');

    await use(new OrdersPage(page));
  },

  mockOrdersApi: async ({ page }, use) => {
    const setup = async (response: MockOrderResponse) => {
      await page.route((url: URL) => url.pathname === '/api/orders', (route) => {
        if (route.request().method() === 'POST') {
          route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify(response),
          });
        } else {
          route.continue();
        }
      });
    };
    await use(setup);
  },

  mockOrderHistoryApi: async ({ page }, use) => {
    const setup = async (orders: MockOrderResponse[]) => {
      await page.route(
        (url: URL) => url.pathname === '/api/orders',
        (route) => {
          if (route.request().method() === 'GET') {
            route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                orders,
                pagination: {
                  page: 1,
                  limit: 10,
                  total: orders.length,
                  totalPages: Math.max(1, Math.ceil(orders.length / 10)),
                },
              }),
            });
          } else {
            route.continue();
          }
        }
      );
    };
    await use(setup);
  },
});

export { expect } from '@playwright/test';
