import { test, expect } from '@playwright/test'

test.describe('POST /api/orders/payment-intent', () => {
  let token: string

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { username: 'admin', password: 'password123' },
    })
    token = (await res.json()).token
  })

  test('positive: returns clientSecret for valid amount', async ({ request }) => {
    const res = await request.post('/api/orders/payment-intent', {
      headers: { Authorization: `Bearer ${token}` },
      data: { amount: 100000 },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('clientSecret')
    expect(typeof body.clientSecret).toBe('string')
  })

  test('negative: no auth returns 401', async ({ request }) => {
    const res = await request.post('/api/orders/payment-intent', {
      data: { amount: 100000 },
    })
    expect(res.status()).toBe(401)
  })
})
