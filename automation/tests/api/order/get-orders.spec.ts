import { test, expect } from '@playwright/test'
import * as auth from '../../../api-services/auth.service.js'
import * as order from '../../../api-services/order.service.js'

test.describe('GET /api/orders', () => {
  let token: string

  test.beforeAll(async () => {
    const { token: t } = await auth.login('admin', 'password123')
    token = t
  })

  test('positive: returns paginated orders for authenticated user', async () => {
    const body = await order.getOrders(token)
    expect(Array.isArray(body.orders)).toBeTruthy()
    expect(body.pagination).toHaveProperty('page')
    expect(body.pagination).toHaveProperty('total')
    expect(body.pagination).toHaveProperty('totalPages')
  })

  test('negative: no auth returns 401', async () => {
    await expect(order.getOrders(null)).rejects.toMatchObject({ statusCode: 401 })
  })
})
