import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'Tài khoản' });
    this.passwordInput = page.getByRole('textbox', { name: 'Mật khẩu' });
    this.loginButton = page.getByRole('button', { name: 'Đăng nhập' });
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
}
