import { chromium } from '@playwright/test'

/**
 * Global setup: warm up Vite dev server so that all routes are compiled
 * and cached before tests start. This prevents the first test to visit
 * /admin/users from timing out while Vite lazily compiles modules.
 */
async function globalSetup() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  try {
    // Visit key routes to trigger Vite module compilation
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 30000 })
    await page.goto('http://localhost:5173/admin/users', { waitUntil: 'networkidle', timeout: 30000 })
    await page.goto('http://localhost:5173/orders', { waitUntil: 'networkidle', timeout: 30000 })
  } catch {
    // Best-effort warmup — don't fail if server isn't ready yet
  } finally {
    await browser.close()
  }
}

export default globalSetup
