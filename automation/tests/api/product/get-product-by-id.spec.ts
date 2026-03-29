import { test, expect } from '@playwright/test'

test.describe('GET /api/products/:id', () => {
  let token: string
  let productId: string

  test.beforeAll(async ({ request }) => {
    const loginRes = await request.post('/api/auth/login', {
      data: { username: 'admin', password: 'password123' },
    })
    token = (await loginRes.json()).token

    const res = await request.get('/api/products', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const products = await res.json()
    if (products.length > 0) productId = products[0]._id
  })

  test('positive: returns product by valid id', async ({ request }) => {
    if (!productId) test.skip()
    const res = await request.get(`/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body._id).toBe(productId)
    expect(body).toHaveProperty('name')
    expect(body).toHaveProperty('price')
  })

  test('negative: non-existent id returns 404', async ({ request }) => {
    const res = await request.get('/api/products/000000000000000000000000', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect([404, 500]).toContain(res.status())
  })

  test('negative: malformed id returns error', async ({ request }) => {
    const res = await request.get('/api/products/not-a-valid-id', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
  })

  test('negative: no auth returns 401', async ({ request }) => {
    if (!productId) test.skip()
    const res = await request.get(`/api/products/${productId}`)
    expect(res.status()).toBe(401)
  })
})
