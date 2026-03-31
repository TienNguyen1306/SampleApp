import { test, expect } from '@playwright/test'

const ADMIN_CREDS = { username: 'admin', password: 'password123' }

test.describe('POST /api/products', () => {
  let adminToken: string
  let createdProductId: string | null = null

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/login', { data: ADMIN_CREDS })
    const body = await res.json()
    adminToken = body.token
  })

  test.afterAll(async ({ request }) => {
    if (createdProductId) {
      await request.delete(`/api/products/${createdProductId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
    }
  })

  test('positive: admin can add a new product', async ({ request }) => {
    const res = await request.post('/api/products', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        name: `Test Product ${Date.now()}`,
        price: 50000,
        emoji: '🛒',
        tag: 'new',
        category: 'food',
        stock: 10,
      },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body).toHaveProperty('_id')
    expect(body.price).toBe(50000)
    createdProductId = body._id

    // Verify via GET that the product was actually created
    const getRes = await request.get(`/api/products/${createdProductId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    expect(getRes.status()).toBe(200)
    const getBody = await getRes.json()
    expect(getBody._id).toBe(createdProductId)
    expect(getBody.price).toBe(50000)
  })

  test('negative: missing required fields returns 400', async ({ request }) => {
    const res = await request.post('/api/products', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: 'Incomplete Product' },
    })
    expect(res.status()).toBe(400)
  })

  test('negative: invalid price returns 400', async ({ request }) => {
    const res = await request.post('/api/products', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: 'Bad Price', price: -100, emoji: '🛒', tag: 'new', category: 'food', stock: 5 },
    })
    expect(res.status()).toBe(400)
  })

  test('negative: unauthenticated request returns 401', async ({ request }) => {
    const res = await request.post('/api/products', {
      data: { name: 'Unauth', price: 50000, emoji: '🛒', tag: 'new', category: 'food', stock: 5 },
    })
    expect(res.status()).toBe(401)
  })
})
