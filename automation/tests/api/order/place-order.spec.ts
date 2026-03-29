import { test, expect } from '@playwright/test'

test.describe('POST /api/orders', () => {
  let token: string

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { username: 'admin', password: 'password123' },
    })
    token = (await res.json()).token
  })

  const validOrder = {
    items: [{ productId: '000000000000000000000001', name: 'Test', price: 50000, quantity: 1 }],
    recipientName: 'Test User',
    recipientPhone: '0901234567',
    address: '123 Test Street',
    paymentMethod: 'cod',
    totalPrice: 50000,
  }

  test('positive: place order returns 201 with order object', async ({ request }) => {
    const res = await request.post('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
      data: validOrder,
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body).toHaveProperty('_id')
    expect(body).toHaveProperty('userId')
    expect(body.status).toBe('confirmed')
    expect(body.recipientName).toBe('Test User')
  })

  test('negative: no auth returns 401', async ({ request }) => {
    const res = await request.post('/api/orders', { data: validOrder })
    expect(res.status()).toBe(401)
  })
})
