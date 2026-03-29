import { test, expect } from '@playwright/test'

test.describe('GET /api/profile', () => {
  let token: string

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { username: 'admin', password: 'password123' },
    })
    token = (await res.json()).token
  })

  test('positive: returns profile of authenticated user', async ({ request }) => {
    const res = await request.get('/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('id')
    expect(body).toHaveProperty('username')
    expect(body).toHaveProperty('name')
    expect(body).toHaveProperty('role')
    expect(body).not.toHaveProperty('password')
  })

  test('negative: no auth returns 401', async ({ request }) => {
    const res = await request.get('/api/profile')
    expect(res.status()).toBe(401)
  })

  test('negative: invalid token returns 401', async ({ request }) => {
    const res = await request.get('/api/profile', {
      headers: { Authorization: 'Bearer bad.token.xyz' },
    })
    expect(res.status()).toBe(401)
  })
})
