import { test, expect } from '@playwright/test'

test.describe('GET /api/auth/me', () => {
  let token: string

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { username: 'admin', password: 'password123' },
    })
    const body = await res.json()
    token = body.token
  })

  test('positive: returns current user info with valid token', async ({ request }) => {
    const res = await request.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.username).toBe('admin')
    expect(body).toHaveProperty('id')
    expect(body).toHaveProperty('name')
    expect(body).toHaveProperty('role')
    expect(body).not.toHaveProperty('password')
  })

  test('negative: no token returns 401', async ({ request }) => {
    const res = await request.get('/api/auth/me')
    expect(res.status()).toBe(401)
  })

  test('negative: invalid token returns 401', async ({ request }) => {
    const res = await request.get('/api/auth/me', {
      headers: { Authorization: 'Bearer invalid.token.here' },
    })
    expect(res.status()).toBe(401)
  })
})
