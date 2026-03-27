import { test, expect } from '../fixtures/user.management.fixture';

/**
 * E2E tests - User Management (no mocks, hits real backend localhost:3001 + frontend localhost:5173)
 * Prerequisites: both servers must be running, admin account: admin / password123
 */
test.describe('E2E - User Management', () => {

  /**
   * Scenario 1: Create non-admin user → login → verify CANNOT access user management → delete
   */
  test.describe('Non-admin user access control', () => {

    const newUser = {
      name: 'E2E Regular User',
      username: `e2e_regular_${Date.now()}`,
      password: 'Test1234@',
      role: 'customer' as const,
    };

    test('should create non-admin user, verify no access to user management, then delete', async ({
      page,
      loginPage,
      homePage,
      adminUsersPage,
    }) => {
      // ── Step 1: Login as admin ──────────────────────────────────────────
      await loginPage.navigate();
      await loginPage.login('admin', 'password123');
      await page.waitForURL('**/home');
      await expect(page).toHaveURL(/\/home/);

      // ── Step 2: Navigate to user management page ────────────────────────
      await adminUsersPage.navigate();
      await expect(adminUsersPage.pageTitle).toBeVisible();

      // ── Step 3: Create a new non-admin (customer) user ──────────────────
      const countBefore = await adminUsersPage.getUserCount();
      await adminUsersPage.addUser(newUser.name, newUser.username, newUser.password, newUser.role);
      await adminUsersPage.waitForLoaded();
      const countAfter = await adminUsersPage.getUserCount();
      expect(countAfter).toBeGreaterThan(countBefore);

      // Verify new user appears in the table
      await expect(adminUsersPage.getUserRow(newUser.username)).toBeVisible();

      // ── Step 4: Logout ──────────────────────────────────────────────────
      await page.goto('/home');
      await homePage.logoutButton.click();
      await page.waitForURL('**/login');

      // ── Step 5: Login as the new non-admin user ─────────────────────────
      await loginPage.login(newUser.username, newUser.password);
      await page.waitForURL('**/home');

      // ── Step 6: Verify "Quản lý User" button is NOT visible ─────────────
      const adminUsersBtn = adminUsersPage.getAdminUsersButton();
      await expect(adminUsersBtn).not.toBeVisible();

      // ── Step 7: Try accessing /admin/users directly → should be blocked ─
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');

      // Should either redirect away or show no data (403 from API)
      // The page URL should not stay at /admin/users with data loaded,
      // OR the API call returns 403 and no user rows are shown
      const isRedirected = !page.url().includes('/admin/users');
      const hasNoRows = (await page.locator('.au-table tbody tr').count()) === 0;
      expect(isRedirected || hasNoRows).toBeTruthy();

      // ── Step 8: Logout and login back as admin to delete the user ────────
      await page.goto('/home');
      await homePage.logoutButton.click();
      await page.waitForURL('**/login');

      await loginPage.login('admin', 'password123');
      await page.waitForURL('**/home');
      await adminUsersPage.navigate();

      // ── Step 9: Delete the newly created user ────────────────────────────
      await adminUsersPage.deleteUserByUsername(newUser.username);
      await adminUsersPage.waitForLoaded();

      // Verify user is gone from the table
      await expect(adminUsersPage.getUserRow(newUser.username)).not.toBeVisible();
    });

  });

  /**
   * Scenario 2: Create admin user → login → verify CAN access user management → delete
   */
  test.describe('Admin user access control', () => {

    const newAdmin = {
      name: 'E2E Admin User',
      username: `e2e_admin_${Date.now()}`,
      password: 'Admin1234@',
      role: 'admin' as const,
    };

    test('should create admin user, verify access to user management, then delete', async ({
      page,
      loginPage,
      homePage,
      adminUsersPage,
    }) => {
      // ── Step 1: Login as admin ──────────────────────────────────────────
      await loginPage.navigate();
      await loginPage.login('admin', 'password123');
      await page.waitForURL('**/home');

      // ── Step 2: Navigate to user management and create new admin user ────
      await adminUsersPage.navigate();
      await expect(adminUsersPage.pageTitle).toBeVisible();

      const countBefore = await adminUsersPage.getUserCount();
      await adminUsersPage.addUser(newAdmin.name, newAdmin.username, newAdmin.password, newAdmin.role);
      await adminUsersPage.waitForLoaded();

      // Verify new admin user appears with admin role badge
      const adminRow = adminUsersPage.getUserRow(newAdmin.username);
      await expect(adminRow).toBeVisible();
      await expect(adminRow.locator('.au-role-badge.role-admin')).toBeVisible();

      const countAfter = await adminUsersPage.getUserCount();
      expect(countAfter).toBeGreaterThan(countBefore);

      // ── Step 3: Logout ──────────────────────────────────────────────────
      await page.goto('/home');
      await homePage.logoutButton.click();
      await page.waitForURL('**/login');

      // ── Step 4: Login as new admin user ─────────────────────────────────
      await loginPage.login(newAdmin.username, newAdmin.password);
      await page.waitForURL('**/home');

      // ── Step 5: Verify "Quản lý User" button IS visible ─────────────────
      const adminUsersBtn = adminUsersPage.getAdminUsersButton();
      await expect(adminUsersBtn).toBeVisible();

      // ── Step 6: Click and verify can access /admin/users with data ───────
      await adminUsersBtn.click();
      await page.waitForURL('**/admin/users');
      await page.waitForLoadState('networkidle');

      await expect(adminUsersPage.pageTitle).toBeVisible();
      // Should see at least the default admin user in the list
      const rowCount = await adminUsersPage.getUserCount();
      expect(rowCount).toBeGreaterThan(0);

      // ── Step 7: Logout and login back as main admin to clean up ──────────
      await page.goto('/home');
      await homePage.logoutButton.click();
      await page.waitForURL('**/login');

      await loginPage.login('admin', 'password123');
      await page.waitForURL('**/home');
      await adminUsersPage.navigate();

      // ── Step 8: Delete the newly created admin user ───────────────────────
      await adminUsersPage.deleteUserByUsername(newAdmin.username);
      await adminUsersPage.waitForLoaded();

      // Verify user is deleted
      await expect(adminUsersPage.getUserRow(newAdmin.username)).not.toBeVisible();
    });

  });

});
