import { test as base, APIRequestContext } from '@playwright/test'

export const BASE_URL = 'http://localhost:3001'
export const APP_KEY = process.env.APP_SECRET || ''

type ApiFixtures = {
  adminToken: string
  userToken: string
}

export const test = base.extend<ApiFixtures>({
  adminToken: async ({ request }, use) => {
    const res = await request.post('/api/auth/login', {
      data: { username: 'admin', password: 'password123' },
    })
    const body = await res.json()
    await use(body.token as string)
  },

  userToken: async ({ request }, use) => {
    const username = `testuser_${Date.now()}`
    // Register a temp user
    const regRes = await request.post('/api/auth/register', {
      multipart: {
        username,
        password: 'password123',
        name: 'Test User',
      },
    })
    const regBody = await regRes.json()
    const token = regBody.token as string
    const userId = regBody.user?.id as string

    await use(token)

    // Cleanup: login as admin and delete
    const loginRes = await request.post('/api/auth/login', {
      data: { username: 'admin', password: 'password123' },
    })
    const adminBody = await loginRes.json()
    await request.delete('/api/users', {
      headers: {
        Authorization: `Bearer ${adminBody.token}`,
        'X-App-Key': APP_KEY,
      },
      data: { ids: [userId] },
    })
  },
})

export { expect } from '@playwright/test'
