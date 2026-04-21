import { defineConfig, devices } from '@playwright/test';

// Load .env from automation directory (Node.js 22+ built-in)
try { process.loadEnvFile('.env') } catch { /* file is optional */ }

export default defineConfig({
  globalSetup: './global-setup.ts',
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  reporter: 'html',
  expect: { timeout: 10000 },
  use: { navigationTimeout: 60000, actionTimeout: 15000 },
  projects: [
    {
      name: 'ui-chromium',
      testMatch: 'tests/ui/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
      },
    },
    {
      name: 'ui-webkit',
      testMatch: 'tests/ui/**/*.spec.ts',
      use: {
        ...devices['Desktop Safari'],
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
      },
    },
    {
      name: 'api',
      testMatch: 'tests/api/**/*.spec.ts',
      use: {
        baseURL: 'http://localhost:3001',
      },
    },
  ],
});
