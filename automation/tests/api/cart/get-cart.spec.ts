import { test, expect } from '@playwright/test'

test.describe('GET /api/cart', () => {
  let token: string

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { username: 'admin', password: 'password123' },
    })
    token = (await res.json()).token
  })

  test('positive: returns cart items array for authenticated user', async ({ request }) => {
    const res = await request.get('/api/cart', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBeTruthy()
  })

  test('negative: no auth returns 401', async ({ request }) => {
    const res = await request.get('/api/cart')
    expect(res.status()).toBe(401)
  })
})
