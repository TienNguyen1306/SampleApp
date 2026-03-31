import { test, expect } from '@playwright/test'

const ADMIN_CREDS = { username: 'admin', password: 'password123' }
const KEY = process.env.APP_SECRET || ''

test.describe('POST /api/auth/register', () => {
  let createdUserId: string | null = null
  let adminToken: string | null = null

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/login', { data: ADMIN_CREDS })
    const body = await res.json()
    adminToken = body.token
  })

  test.afterAll(async ({ request }) => {
    if (createdUserId && adminToken) {
      await request.delete('/api/users', {
        headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
        data: { ids: [createdUserId] },
      })
    }
  })

  test('positive: register new user returns 201 with token', async ({ request }) => {
    const username = `reg_user_${Date.now()}`
    const res = await request.post('/api/auth/register', {
      multipart: { username, password: 'password123', name: 'New User' },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body).toHaveProperty('token')
    expect(body.user.username).toBe(username)
    expect(body.user.role).toBe('customer')
    createdUserId = body.user.id

    // Verify via GET /api/auth/me that the new user is authenticated and data is correct
    const meRes = await request.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${body.token}` },
    })
    expect(meRes.status()).toBe(200)
    const meBody = await meRes.json()
    expect(meBody.username).toBe(username)
    expect(meBody.role).toBe('customer')
  })

  test('negative: duplicate username returns 409', async ({ request }) => {
    const res = await request.post('/api/auth/register', {
      multipart: { username: 'admin', password: 'password123', name: 'Dup' },
    })
    expect(res.status()).toBe(409)
  })

  test('negative: missing name returns 400', async ({ request }) => {
    const res = await request.post('/api/auth/register', {
      multipart: { username: `user_${Date.now()}`, password: 'password123' },
    })
    expect(res.status()).toBe(400)
  })

  test('negative: short username returns 400', async ({ request }) => {
    const res = await request.post('/api/auth/register', {
      multipart: { username: 'ab', password: 'password123', name: 'Test' },
    })
    expect(res.status()).toBe(400)
  })

  test('negative: short password returns 400', async ({ request }) => {
    const res = await request.post('/api/auth/register', {
      multipart: { username: `user_${Date.now()}`, password: '123', name: 'Test' },
    })
    expect(res.status()).toBe(400)
  })
})
