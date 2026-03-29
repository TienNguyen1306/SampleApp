import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { ProfilePage } from '../pages/profile.page';
import { AdminUsersPage } from '../pages/admin.users.page';

type ProfileFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  profilePage: ProfilePage;
  adminUsersPage: AdminUsersPage;
};

export const test = base.extend<ProfileFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
  adminUsersPage: async ({ page }, use) => {
    await use(new AdminUsersPage(page));
  },
});

export { expect } from '@playwright/test';
