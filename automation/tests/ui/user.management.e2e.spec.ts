import { test, expect } from '../../fixtures/user.management.fixture';

/**
 * E2E tests - User Management (no mocks, hits real backend localhost:3001 + frontend localhost:5173)
 * Prerequisites: both servers must be running, admin account: admin / password123
 */
test.describe('E2E - User Management', () => {
  test.describe.configure({ mode: 'serial' })

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
      loginPage,
      adminUsersPage,
    }) => {
      // ── Step 1: Login as admin ──────────────────────────────────────────
      await loginPage.navigate();
      await loginPage.login('admin', 'password123');
      await loginPage.waitForHome();

      // ── Step 2: Navigate to user management page ────────────────────────
      await adminUsersPage.navigate();
      await expect(adminUsersPage.pageTitle).toBeVisible();

      // ── Step 3: Create a new non-admin (customer) user ──────────────────
      await adminUsersPage.addUser(newUser.name, newUser.username, newUser.password, newUser.role);
      await adminUsersPage.waitForLoaded();

      // Verify new user appears in the table
      await expect(adminUsersPage.getUserRow(newUser.username)).toBeVisible();

      // ── Step 4: Logout ──────────────────────────────────────────────────
      await adminUsersPage.logout();

      // ── Step 5: Login as the new non-admin user ─────────────────────────
      await loginPage.login(newUser.username, newUser.password);
      await loginPage.waitForHome();

      // ── Step 6: Verify "Quản lý User" button is NOT visible ─────────────
      await expect(adminUsersPage.getAdminUsersButton()).not.toBeVisible();

      // ── Step 7: Try accessing /admin/users directly → should be blocked ─
      await adminUsersPage.tryDirectAccess();

      // Should either redirect away or show no data (403 from API)
      const isBlocked = await adminUsersPage.isAccessBlocked();
      expect(isBlocked).toBeTruthy();

      // ── Step 8: Logout and login back as admin to delete the user ────────
      await adminUsersPage.logout();

      await loginPage.login('admin', 'password123');
      await loginPage.waitForHome();
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
      loginPage,
      adminUsersPage,
    }) => {
      // ── Step 1: Login as admin ──────────────────────────────────────────
      await loginPage.navigate();
      await loginPage.login('admin', 'password123');
      await loginPage.waitForHome();

      // ── Step 2: Navigate to user management and create new admin user ────
      await adminUsersPage.navigate();
      await expect(adminUsersPage.pageTitle).toBeVisible();

      await adminUsersPage.addUser(newAdmin.name, newAdmin.username, newAdmin.password, newAdmin.role);
      await adminUsersPage.waitForLoaded();

      // Verify new admin user appears with admin role badge
      const adminRow = adminUsersPage.getUserRow(newAdmin.username);
      await expect(adminRow).toBeVisible();
      await expect(adminRow.locator('.au-role-badge.role-admin')).toBeVisible();

      // ── Step 3: Logout ──────────────────────────────────────────────────
      await adminUsersPage.logout();

      // ── Step 4: Login as new admin user ─────────────────────────────────
      await loginPage.login(newAdmin.username, newAdmin.password);
      await loginPage.waitForHome();

      // ── Step 5: Verify "Quản lý User" button IS visible ─────────────────
      await expect(adminUsersPage.getAdminUsersButton()).toBeVisible();

      // ── Step 6: Click and verify can access /admin/users with data ───────
      await adminUsersPage.clickAdminUsersButton();
      await expect(adminUsersPage.pageTitle).toBeVisible();
      // Should see at least the default admin user in the list
      const rowCount = await adminUsersPage.getUserCount();
      expect(rowCount).toBeGreaterThan(0);

      // ── Step 7: Logout and login back as main admin to clean up ──────────
      await adminUsersPage.logout();

      await loginPage.login('admin', 'password123');
      await loginPage.waitForHome();
      await adminUsersPage.navigate();

      // ── Step 8: Delete the newly created admin user ───────────────────────
      await adminUsersPage.deleteUserByUsername(newAdmin.username);
      await adminUsersPage.waitForLoaded();

      // Verify user is deleted
      await expect(adminUsersPage.getUserRow(newAdmin.username)).not.toBeVisible();
    });

  });

});
