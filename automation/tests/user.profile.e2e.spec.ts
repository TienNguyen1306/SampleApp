import path from 'path';
import { test, expect } from '../fixtures/profile.fixture';

const AVATAR_PATH = path.join(__dirname, '../assets/test-avatar.png');

/**
 * E2E test - User Profile (no mocks, hits real backend localhost:3001 + frontend localhost:5173)
 * Prerequisites: both servers must be running, admin account: admin / password123
 *
 * Steps:
 * 1. Register a new user (no avatar at registration)
 * 2. Login with the new user
 * 3. Go to /profile, change name + upload avatar
 * 4. Save and verify success message
 * 5. Go back to home — verify new name and avatar in header
 * 6. Logout
 * 7. Login as admin → delete the newly created user
 */
test.describe('E2E - User Profile', () => {

  const newUser = {
    name: 'E2E Profile User',
    updatedName: 'E2E Updated Name',
    username: `e2e_profile_${Date.now()}`,
    password: 'Test1234@',
  };

  test('should register, update profile (name + avatar), verify on home, then cleanup', async ({
    loginPage,
    registerPage,
    profilePage,
    adminUsersPage,
  }) => {

    // ── Step 1: Register new user (without avatar) ───────────────────────
    await registerPage.navigate();
    await registerPage.register(newUser.name, newUser.username, newUser.password);

    // After register → auto redirect to /home
    await expect(registerPage.page).toHaveURL(/\/home/);

    // ── Step 2: Go to profile page ───────────────────────────────────────
    await profilePage.navigate();
    await expect(profilePage.nameInput).toBeVisible();

    // Verify initial name is correct
    await expect(profilePage.nameInput).toHaveValue(newUser.name);

    // ── Step 3: Update name and upload avatar ────────────────────────────
    await profilePage.updateName(newUser.updatedName);
    await profilePage.uploadAvatar(AVATAR_PATH);

    // ── Step 4: Save and verify success ─────────────────────────────────
    await profilePage.save();
    await expect(profilePage.successMessage).toBeVisible();

    // ── Step 5: Go back to home ──────────────────────────────────────────
    await profilePage.goHome();

    // Verify updated name shown in header
    const headerUsername = profilePage.page.getByTestId('header-username');
    await expect(headerUsername).toContainText(newUser.updatedName);

    // Verify avatar is now shown (img tag, not placeholder)
    const headerAvatar = profilePage.page.getByTestId('header-avatar');
    await expect(headerAvatar).toBeVisible();

    // ── Step 6: Logout ───────────────────────────────────────────────────
    await adminUsersPage.logout();

    // ── Step 7: Login as admin and delete the test user ──────────────────
    await loginPage.login('admin', 'password123');
    await loginPage.waitForHome();

    await adminUsersPage.navigate();
    await adminUsersPage.deleteUserByUsername(newUser.username);
    await adminUsersPage.waitForLoaded();

    // Verify user is gone from the table
    await expect(adminUsersPage.getUserRow(newUser.username)).not.toBeVisible();
  });

});
