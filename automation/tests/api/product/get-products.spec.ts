import { test, expect } from '@playwright/test'

test.describe('GET /api/products', () => {
  let token: string

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { username: 'admin', password: 'password123' },
    })
    token = (await res.json()).token
  })

  test('positive: returns array of products', async ({ request }) => {
    const res = await request.get('/api/products', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBeTruthy()
  })

  test('positive: filter by category returns matching products', async ({ request }) => {
    const res = await request.get('/api/products?category=food', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBeTruthy()
    body.forEach((p: any) => expect(p.category).toBe('food'))
  })

  test('positive: filter by tag returns array', async ({ request }) => {
    const res = await request.get('/api/products?tag=hot', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBeTruthy()
  })

  test('negative: no auth returns 401', async ({ request }) => {
    const res = await request.get('/api/products')
    expect(res.status()).toBe(401)
  })
})
