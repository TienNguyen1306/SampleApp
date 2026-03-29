import { Page, Locator } from '@playwright/test';
import path from 'path';

export class RegisterPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly avatarInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByTestId('reg-name');
    this.usernameInput = page.getByTestId('reg-username');
    this.passwordInput = page.getByTestId('reg-password');
    this.confirmPasswordInput = page.getByTestId('reg-confirm-password');
    this.avatarInput = page.getByTestId('reg-avatar-input');
    this.submitButton = page.getByTestId('reg-submit');
    this.errorMessage = page.locator('.error-message');
  }

  async navigate() {
    await this.page.goto('/register');
    await this.page.waitForLoadState('networkidle');
  }

  async register(
    name: string,
    username: string,
    password: string,
    avatarPath?: string
  ) {
    await this.nameInput.fill(name);
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);

    if (avatarPath) {
      await this.avatarInput.setInputFiles(avatarPath);
    }

    await this.submitButton.click();
    await this.page.waitForURL('**/home', { timeout: 10000 });
  }
}
