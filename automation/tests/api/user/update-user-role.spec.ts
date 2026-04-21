import { test, expect } from '@playwright/test'

const KEY = process.env.APP_SECRET || ''

test.describe('PATCH /api/users/:id/role', () => {
  test.describe.configure({ mode: 'serial' })

  let adminToken: string
  let testUserId: string

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { username: 'admin', password: 'password123' },
    })
    adminToken = (await res.json()).token

    // Create test user
    const createRes = await request.post('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
      data: { username: `role_test_${Date.now()}`, password: 'password123', name: 'Role Test' },
    })
    testUserId = (await createRes.json())._id
  })

  test.afterAll(async ({ request }) => {
    if (testUserId) {
      await request.delete('/api/users', {
        headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
        data: { ids: [testUserId] },
      })
    }
  })

  test('positive: update role to admin', async ({ request }) => {
    const res = await request.patch(`/api/users/${testUserId}/role`, {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
      data: { role: 'admin' },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.role).toBe('admin')

    // Verify via GET that the role change is persisted
    const getRes = await request.get('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
    })
    const { users } = await getRes.json()
    const user = users.find((u: any) => u._id === testUserId)
    expect(user).toBeDefined()
    expect(user.role).toBe('admin')
  })

  test('positive: update role back to customer', async ({ request }) => {
    const res = await request.patch(`/api/users/${testUserId}/role`, {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
      data: { role: 'customer' },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.role).toBe('customer')

    // Verify via GET that the role change is persisted
    const getRes = await request.get('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
    })
    const { users } = await getRes.json()
    const user = users.find((u: any) => u._id === testUserId)
    expect(user).toBeDefined()
    expect(user.role).toBe('customer')
  })

  test('negative: invalid role returns 400', async ({ request }) => {
    const res = await request.patch(`/api/users/${testUserId}/role`, {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
      data: { role: 'superadmin' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.errorCode).toBe('INVALID_ROLE')
  })

  test('negative: change admin user role returns 403', async ({ request }) => {
    const getUsersRes = await request.get('/api/users?search=admin', {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
    })
    const { users } = await getUsersRes.json()
    const adminUser = users.find((u: any) => u.username === 'admin')

    const res = await request.patch(`/api/users/${adminUser._id}/role`, {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
      data: { role: 'customer' },
    })
    expect(res.status()).toBe(403)
  })

  test('negative: non-existent user returns 404', async ({ request }) => {
    const res = await request.patch('/api/users/000000000000000000000000/role', {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
      data: { role: 'admin' },
    })
    expect(res.status()).toBe(404)
  })

  test('negative: missing X-App-Key returns 403', async ({ request }) => {
    const res = await request.patch(`/api/users/${testUserId}/role`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { role: 'admin' },
    })
    expect(res.status()).toBe(403)
  })
})
