import { Page, Locator } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly avatarInput: Locator;
  readonly avatarImage: Locator;
  readonly saveButton: Locator;
  readonly backButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByTestId('profile-name');
    this.avatarInput = page.getByTestId('profile-avatar-input');
    this.avatarImage = page.locator('.pf-avatar-img');
    this.saveButton = page.getByTestId('profile-save');
    this.backButton = page.locator('.pf-back');
    this.successMessage = page.getByTestId('profile-success');
    this.errorMessage = page.getByTestId('profile-error');
  }

  async navigate() {
    await this.page.goto('/profile');
    await this.page.waitForLoadState('networkidle');
  }

  async updateName(newName: string) {
    await this.nameInput.clear();
    await this.nameInput.fill(newName);
  }

  async uploadAvatar(avatarPath: string) {
    await this.avatarInput.setInputFiles(avatarPath);
  }

  async save() {
    await this.saveButton.click();
    await this.successMessage.waitFor({ state: 'visible', timeout: 8000 });
  }

  async goHome() {
    await this.backButton.click();
    await this.page.waitForURL('**/home', { timeout: 8000 });
    await this.page.waitForLoadState('networkidle');
  }
}
