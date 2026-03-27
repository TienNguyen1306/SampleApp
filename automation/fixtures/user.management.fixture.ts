import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { HomePage } from '../pages/home.page';
import { AdminUsersPage } from '../pages/admin.users.page';

type UserManagementFixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  adminUsersPage: AdminUsersPage;
};

export const test = base.extend<UserManagementFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  adminUsersPage: async ({ page }, use) => {
    await use(new AdminUsersPage(page));
  },
});

export { expect } from '@playwright/test';
