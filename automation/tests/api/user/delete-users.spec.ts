import { test, expect } from '@playwright/test'

const KEY = process.env.APP_SECRET || ''

test.describe('DELETE /api/users', () => {
  let adminToken: string

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { username: 'admin', password: 'password123' },
    })
    adminToken = (await res.json()).token
  })

  test('positive: delete a user by id', async ({ request }) => {
    // Create user to delete
    const username = `del_${Date.now()}`
    const createRes = await request.post('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
      data: { username, password: 'password123', name: 'To Delete' },
    })
    const { _id } = await createRes.json()

    const res = await request.delete('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
      data: { ids: [_id] },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.deletedCount).toBe(1)
  })

  test('negative: try to delete admin user returns 403', async ({ request }) => {
    const getUsersRes = await request.get('/api/users?search=admin', {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
    })
    const { users } = await getUsersRes.json()
    const adminUser = users.find((u: any) => u.username === 'admin')

    const res = await request.delete('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
      data: { ids: [adminUser._id] },
    })
    expect(res.status()).toBe(403)
    const body = await res.json()
    expect(body.errorCode).toBe('CANNOT_DELETE_ADMIN')
  })

  test('negative: empty ids array returns 400', async ({ request }) => {
    const res = await request.delete('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
      data: { ids: [] },
    })
    expect(res.status()).toBe(400)
  })

  test('negative: missing X-App-Key returns 403', async ({ request }) => {
    const res = await request.delete('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { ids: ['000000000000000000000001'] },
    })
    expect(res.status()).toBe(403)
  })
})
