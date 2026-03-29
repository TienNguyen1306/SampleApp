import { defineConfig, devices } from '@playwright/test';

// Load .env from automation directory (Node.js 22+ built-in)
try { process.loadEnvFile('.env') } catch { /* file is optional */ }

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
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
