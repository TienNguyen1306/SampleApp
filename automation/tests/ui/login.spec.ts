import { test, expect } from '../../fixtures/auth.fixture';
import { validUsers, invalidUsers } from '../../data/users.data';

test.describe('Login Page', () => {

  test.describe('Valid login - data driven', () => {
    for (const user of validUsers) {
      test(`should login successfully with ${user.description}`, async ({ loginPage, homePage, mockLoginApi }) => {
        await mockLoginApi(user.mockResponse);
        await loginPage.login(user.username, user.password);

        await loginPage.assertOnHomePage();
        await homePage.assertIsLoggedIn();
        await homePage.assertWelcomeText(user.expectedName);
      });
    }
  });

  test.describe('Invalid login - data driven', () => {
    for (const user of invalidUsers) {
      test(`should reject login with ${user.description}`, async ({ loginPage }) => {
        await loginPage.login(user.username, user.password);

        await loginPage.assertNotOnHomePage();
        await loginPage.assertLoginButtonVisible();
      });
    }
  });

  test('should display login form elements', async ({ loginPage }) => {
    await loginPage.assertFormVisible();
  });

  test('should be already logged in via fixture', async ({ loggedInPage }) => {
    await loggedInPage.assertIsLoggedIn();
    await loggedInPage.assertWelcomeText('Admin User');
  });

});
