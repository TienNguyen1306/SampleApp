import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByTestId('login-username');
    this.passwordInput = page.getByTestId('login-password');
    this.loginButton = page.getByTestId('login-submit');
  }

  async navigate() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async waitForHome() {
    await this.page.waitForURL('**/home');
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async assertOnHomePage() {
    await expect(this.page).toHaveURL(/\/home/);
  }

  async assertNotOnHomePage() {
    await expect(this.page).not.toHaveURL(/\/home/);
  }

  async assertFormVisible() {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async assertLoginButtonVisible() {
    await expect(this.loginButton).toBeVisible();
  }
}
