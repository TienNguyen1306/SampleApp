import { test, expect } from '@playwright/test'

test.describe('POST /api/auth/login', () => {
  test('positive: login with valid credentials returns token and user', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { username: 'admin', password: 'password123' },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('token')
    expect(body).toHaveProperty('user')
    expect(body.user.username).toBe('admin')
    expect(body.user).toHaveProperty('id')
    expect(body.user).toHaveProperty('role')
    expect(body.user).not.toHaveProperty('password')
  })

  test('negative: wrong password returns 401', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { username: 'admin', password: 'wrongpass' },
    })
    expect(res.status()).toBe(401)
  })

  test('negative: missing username returns 400', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { password: 'password123' },
    })
    expect(res.status()).toBe(400)
  })

  test('negative: missing password returns 400', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { username: 'admin' },
    })
    expect(res.status()).toBe(400)
  })

  test('negative: non-existent user returns 401', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { username: 'nouser_xyz', password: 'password123' },
    })
    expect(res.status()).toBe(401)
  })
})
