import { test, expect } from '@playwright/test'

const KEY = process.env.APP_SECRET || ''

test.describe('GET /api/users', () => {
  let adminToken: string

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { username: 'admin', password: 'password123' },
    })
    adminToken = (await res.json()).token
  })

  test('positive: admin with X-App-Key returns paginated users', async ({ request }) => {
    const res = await request.get('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('users')
    expect(body).toHaveProperty('total')
    expect(body).toHaveProperty('page')
    expect(Array.isArray(body.users)).toBeTruthy()
  })

  test('positive: search parameter filters results', async ({ request }) => {
    const res = await request.get('/api/users?search=admin', {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.users.length).toBeGreaterThanOrEqual(1)
  })

  test('negative: missing X-App-Key returns 403', async ({ request }) => {
    const res = await request.get('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    expect(res.status()).toBe(403)
  })

  test('negative: wrong X-App-Key returns 403', async ({ request }) => {
    const res = await request.get('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': 'wrong-key' },
    })
    expect(res.status()).toBe(403)
  })

  test('negative: no auth returns 403 (app key checked first)', async ({ request }) => {
    const res = await request.get('/api/users')
    expect(res.status()).toBe(403)
  })
})
