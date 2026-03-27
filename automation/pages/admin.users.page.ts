import { Page, Locator } from '@playwright/test';

export class AdminUsersPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly searchInput: Locator;
  readonly addUserButton: Locator;
  readonly userRows: Locator;

  // Add modal
  readonly addModal: Locator;
  readonly nameInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly roleSelect: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  // Confirm delete modal
  readonly confirmDeleteModal: Locator;
  readonly confirmDeleteButton: Locator;

  // Messages
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('.au-title');
    this.searchInput = page.locator('.au-search');
    this.addUserButton = page.locator('.btn-add-user');
    this.userRows = page.locator('.au-table tbody tr');

    // Add modal
    this.addModal = page.locator('.au-modal').filter({ hasText: /Add New User|Thêm User mới/ });
    this.nameInput = page.locator('.au-form-group').filter({ has: page.locator('label') }).nth(0).locator('input');
    this.usernameInput = page.locator('.au-form-group').filter({ has: page.locator('label') }).nth(1).locator('input');
    this.passwordInput = page.locator('.au-form-group').filter({ has: page.locator('label') }).nth(2).locator('input');
    this.roleSelect = page.locator('.au-form-group').filter({ has: page.locator('label') }).nth(3).locator('select');
    this.submitButton = page.locator('.btn-submit');
    this.cancelButton = page.locator('.btn-cancel').first();

    // Confirm delete modal
    this.confirmDeleteModal = page.locator('.au-confirm');
    this.confirmDeleteButton = page.locator('.btn-delete-confirm');

    // Messages
    this.successMessage = page.locator('.au-success');
    this.errorMessage = page.locator('.au-error');
  }

  async navigate() {
    await this.page.goto('/admin/users');
    await this.page.waitForLoadState('networkidle');
  }

  async waitForLoaded() {
    await this.page.waitForLoadState('networkidle');
  }

  async addUser(name: string, username: string, password: string, role: 'customer' | 'admin') {
    await this.addUserButton.click();
    await this.addModal.waitFor({ state: 'visible' });
    await this.nameInput.fill(name);
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.roleSelect.selectOption(role);
    await this.submitButton.click();
    await this.successMessage.waitFor({ state: 'visible', timeout: 5000 });
  }

  async deleteUserByUsername(username: string) {
    // Find the row for the user and click delete
    const row = this.userRows.filter({ has: this.page.locator('.au-username', { hasText: username }) });
    await row.locator('.btn-del-one').click();
    await this.confirmDeleteModal.waitFor({ state: 'visible' });
    await this.confirmDeleteButton.click();
    await this.successMessage.waitFor({ state: 'visible', timeout: 5000 });
  }

  async getUserCount(): Promise<number> {
    return this.userRows.count();
  }

  getUserRow(username: string): Locator {
    return this.userRows.filter({ has: this.page.locator('.au-username', { hasText: username }) });
  }

  getAdminUsersButton(): Locator {
    return this.page.locator('.admin-btn').filter({ hasText: /Quản lý User|Manage Users/ });
  }
}
