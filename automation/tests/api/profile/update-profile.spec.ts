import { test, expect } from '@playwright/test'

const KEY = process.env.APP_SECRET || ''

test.describe('PATCH /api/profile', () => {
  let token: string
  let userId: string

  test.beforeAll(async ({ request }) => {
    // Create temp user for profile tests
    const username = `profile_test_${Date.now()}`
    const regRes = await request.post('/api/auth/register', {
      multipart: { username, password: 'password123', name: 'Profile Tester' },
    })
    const body = await regRes.json()
    token = body.token
    userId = body.user?.id
  })

  test.afterAll(async ({ request }) => {
    if (userId) {
      const loginRes = await request.post('/api/auth/login', {
        data: { username: 'admin', password: 'password123' },
      })
      const adminToken = (await loginRes.json()).token
      await request.delete('/api/users', {
        headers: { Authorization: `Bearer ${adminToken}`, 'X-App-Key': KEY },
        data: { ids: [userId] },
      })
    }
  })

  test('positive: update name returns updated profile', async ({ request }) => {
    const res = await request.patch('/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
      multipart: { name: 'Updated Name' },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.name).toBe('Updated Name')
    expect(body).toHaveProperty('id')
    expect(body).not.toHaveProperty('password')

    // Verify via GET that the name change is persisted
    const getRes = await request.get('/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(getRes.status()).toBe(200)
    const getBody = await getRes.json()
    expect(getBody.name).toBe('Updated Name')
  })

  test('positive: update without name keeps existing name', async ({ request }) => {
    const res = await request.patch('/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
      multipart: {},
    })
    expect(res.status()).toBe(200)
  })

  test('negative: empty name (whitespace only) returns 400', async ({ request }) => {
    const res = await request.patch('/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
      multipart: { name: '   ' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.errorCode).toBe('MISSING_FIELDS')
  })

  test('negative: no auth returns 401', async ({ request }) => {
    const res = await request.patch('/api/profile', {
      multipart: { name: 'Test' },
    })
    expect(res.status()).toBe(401)
  })
})
