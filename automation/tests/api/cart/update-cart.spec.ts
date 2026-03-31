import { test, expect } from '@playwright/test'

test.describe('PUT /api/cart', () => {
  let token: string

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { username: 'admin', password: 'password123' },
    })
    token = (await res.json()).token
  })

  test('positive: update cart returns ok:true', async ({ request }) => {
    const res = await request.put('/api/cart', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        items: [{ productId: '000000000000000000000001', name: 'Item', price: 50000, quantity: 2 }],
      },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)

    // Verify via GET that the cart was actually updated (returns array directly)
    const getRes = await request.get('/api/cart', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(getRes.status()).toBe(200)
    const items = await getRes.json()
    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBe(1)
    expect(items[0].quantity).toBe(2)
  })

  test('positive: clear cart with empty items array', async ({ request }) => {
    const res = await request.put('/api/cart', {
      headers: { Authorization: `Bearer ${token}` },
      data: { items: [] },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)

    // Verify via GET that the cart is empty (returns array directly)
    const getRes = await request.get('/api/cart', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(getRes.status()).toBe(200)
    const items = await getRes.json()
    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBe(0)
  })

  test('negative: items not array returns 400', async ({ request }) => {
    const res = await request.put('/api/cart', {
      headers: { Authorization: `Bearer ${token}` },
      data: { items: 'invalid' },
    })
    expect(res.status()).toBe(400)
  })

  test('negative: no auth returns 401', async ({ request }) => {
    const res = await request.put('/api/cart', {
      data: { items: [] },
    })
    expect(res.status()).toBe(401)
  })
})
