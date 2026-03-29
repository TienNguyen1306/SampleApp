import { test, expect } from '@playwright/test'

test.describe('GET /api/orders', () => {
  let token: string

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { username: 'admin', password: 'password123' },
    })
    token = (await res.json()).token
  })

  test('positive: returns array of orders for authenticated user', async ({ request }) => {
    const res = await request.get('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBeTruthy()
  })

  test('negative: no auth returns 401', async ({ request }) => {
    const res = await request.get('/api/orders')
    expect(res.status()).toBe(401)
  })
})
