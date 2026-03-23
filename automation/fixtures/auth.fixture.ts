import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { HomePage } from '../pages/home.page';
import { MockLoginResponse } from '../data/users.data';

const LOGIN_API_URL = 'http://localhost:3001/api/auth/login';

type AuthFixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  loggedInPage: HomePage;
  mockLoginApi: (response: MockLoginResponse) => Promise<void>;
};

export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await use(loginPage);
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  loggedInPage: async ({ page }, use) => {
    await page.route(LOGIN_API_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MzI4NDAwNywiZXhwIjoxNzczODg4ODA3fQ.BQ7Jv5xKfelseHdrcCHzeFtnhN5o0CpCJwqKWJGJcDg',
          user: { id: 1, username: 'admin', name: 'Admin User', role: 'admin' },
        }),
      })
    );
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('admin', 'password123');
    await page.waitForURL('**/home');
    await use(new HomePage(page));
  },

  mockLoginApi: async ({ page }, use) => {
    const setup = async (response: MockLoginResponse) => {
      await page.route(LOGIN_API_URL, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(response),
        })
      );
    };
    await use(setup);
  },
});

export { expect } from '@playwright/test';
