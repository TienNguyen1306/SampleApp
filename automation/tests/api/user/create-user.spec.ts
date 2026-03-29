import { test, expect } from '@playwright/test'

const KEY = process.env.APP_SECRET || ''

test.describe('POST /api/users', () => {
  let adminToken: string
  let createdUserId: string | null = null

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { username: 'admin', password: 'password123' },
    })
    adminToken = (await res.json()).token
  })

  test.afterAll(async ({ request }) => {
    if (createdUserId) {
      await request.delete('/api/users', {
        headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
        data: { ids: [createdUserId] },
      })
    }
  })

  test('positive: admin creates user successfully', async ({ request }) => {
    const username = `created_${Date.now()}`
    const res = await request.post('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
      data: { username, password: 'password123', name: 'Created User', role: 'customer' },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.username).toBe(username)
    expect(body).not.toHaveProperty('password')
    createdUserId = body._id
  })

  test('positive: create admin-role user', async ({ request }) => {
    const username = `admin_user_${Date.now()}`
    const res = await request.post('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
      data: { username, password: 'password123', name: 'Admin User', role: 'admin' },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.role).toBe('admin')
    // Cleanup
    await request.delete('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
      data: { ids: [body._id] },
    })
  })

  test('negative: duplicate username returns 409', async ({ request }) => {
    const res = await request.post('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
      data: { username: 'admin', password: 'password123', name: 'Dup' },
    })
    expect(res.status()).toBe(409)
  })

  test('negative: missing required fields returns 400', async ({ request }) => {
    const res = await request.post('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
      data: { username: `u_${Date.now()}` },
    })
    expect(res.status()).toBe(400)
  })

  test('negative: invalid role returns 400', async ({ request }) => {
    const res = await request.post('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
      data: { username: `u_${Date.now()}`, password: 'password123', name: 'Test', role: 'superadmin' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.errorCode).toBe('INVALID_ROLE')
  })

  test('negative: missing X-App-Key returns 403', async ({ request }) => {
    const res = await request.post('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { username: `u_${Date.now()}`, password: 'password123', name: 'Test' },
    })
    expect(res.status()).toBe(403)
  })
})
