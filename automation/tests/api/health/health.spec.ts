import { test, expect } from '@playwright/test'

test.describe('GET /api/health', () => {
  test('positive: returns status ok', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
  })
})
