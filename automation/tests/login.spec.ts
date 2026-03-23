import { test, expect } from '../fixtures/auth.fixture';
import { validUsers, invalidUsers } from '../data/users.data';

test.describe('Login Page', () => {

  test.describe('Valid login - data driven', () => {
    for (const user of validUsers) {
      test(`should login successfully with ${user.description}`, async ({ loginPage, homePage, mockLoginApi }) => {
        await mockLoginApi(user.mockResponse);
        await loginPage.login(user.username, user.password);

        await expect(loginPage.page).toHaveURL(/\/home/);
        await expect(homePage.logoutButton).toBeVisible();
        await expect(homePage.welcomeMessage).toContainText(user.expectedName);
      });
    }
  });

  test.describe('Invalid login - data driven', () => {
    for (const user of invalidUsers) {
      test(`should reject login with ${user.description}`, async ({ loginPage }) => {
        await loginPage.login(user.username, user.password);

        await expect(loginPage.page).not.toHaveURL(/\/home/);
        await expect(loginPage.loginButton).toBeVisible();
      });
    }
  });

  test('should display login form elements', async ({ loginPage }) => {
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should be already logged in via fixture', async ({ loggedInPage }) => {
    await expect(loggedInPage.logoutButton).toBeVisible();
    await expect(loggedInPage.welcomeMessage).toContainText('Admin User');
  });

});
