import { Page, Locator } from '@playwright/test';

export class AdminUsersPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly searchInput: Locator;
  readonly addUserButton: Locator;
  readonly userRows: Locator;

  // Add modal — locators via data-testid (stable, i18n-independent)
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

    // Add modal — use data-testid for stable i18n-independent selection
    this.addModal = page.locator('.au-modal').filter({ hasText: /Add New User|Thêm User mới/ });
    this.nameInput = page.getByTestId('add-user-name');
    this.usernameInput = page.getByTestId('add-user-username');
    this.passwordInput = page.getByTestId('add-user-password');
    this.roleSelect = page.getByTestId('add-user-role');
    this.submitButton = page.locator('.btn-submit');
    this.cancelButton = page.getByTestId('add-user-cancel');

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

  async goHome() {
    await this.page.goto('/home');
    await this.page.waitForLoadState('networkidle');
  }

  async logout() {
    await this.page.goto('/home');
    await this.page.locator('.logout-btn').click();
    await this.page.waitForURL('**/login');
  }

  async tryDirectAccess() {
    await this.page.goto('/admin/users');
    await this.page.waitForLoadState('networkidle');
  }

  async isAccessBlocked(): Promise<boolean> {
    const isRedirected = !this.page.url().includes('/admin/users');
    const hasNoRows = (await this.userRows.count()) === 0;
    return isRedirected || hasNoRows;
  }

  async clickAdminUsersButton() {
    await this.page.locator('.admin-btn').filter({ hasText: /Quản lý User|Manage Users/ }).click();
    await this.page.waitForURL('**/admin/users');
    await this.page.waitForLoadState('networkidle');
  }

  isAdminUsersButtonVisible(): Locator {
    return this.page.locator('.admin-btn').filter({ hasText: /Quản lý User|Manage Users/ });
  }

  getAdminUsersButton(): Locator {
    return this.page.locator('.admin-btn').filter({ hasText: /Quản lý User|Manage Users/ });
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
    const row = this.getUserRow(username);
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
}
