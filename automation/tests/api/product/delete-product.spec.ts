import { test, expect } from '@playwright/test'

const ADMIN_CREDS = { username: 'admin', password: 'password123' }

test.describe('DELETE /api/products/:id', () => {
  let adminToken: string
  let productId: string

  test.beforeAll(async ({ request }) => {
    const loginRes = await request.post('/api/auth/login', { data: ADMIN_CREDS })
    const loginBody = await loginRes.json()
    adminToken = loginBody.token

    // Create a product to delete
    const createRes = await request.post('/api/products', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: `Delete Me ${Date.now()}`, price: 10000, emoji: '🗑️', tag: 'sale', category: 'food', stock: 1 },
    })
    const createBody = await createRes.json()
    productId = createBody._id
  })

  test('positive: admin can delete existing product', async ({ request }) => {
    const res = await request.delete(`/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('message')

    // Verify via GET that the product is actually gone
    const getRes = await request.get(`/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    expect(getRes.status()).toBe(404)
  })

  test('negative: delete non-existent product returns 404', async ({ request }) => {
    const res = await request.delete('/api/products/000000000000000000000000', {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    expect(res.status()).toBe(404)
  })

  test('negative: unauthenticated request returns 401', async ({ request }) => {
    const res = await request.delete(`/api/products/${productId}`)
    expect(res.status()).toBe(401)
  })
})
