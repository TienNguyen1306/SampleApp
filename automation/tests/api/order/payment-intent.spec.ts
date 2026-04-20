import { test, expect } from '@playwright/test'
import * as auth from '../../../api-services/auth.service.js'
import * as order from '../../../api-services/order.service.js'

test.describe('POST /api/orders/payment-intent', () => {
  let token: string

  test.beforeAll(async () => {
    const { token: t } = await auth.login('admin', 'password123')
    token = t
  })

  test('positive: returns clientSecret for valid amount', async () => {
    const body = await order.createPaymentIntent(token, 100000)
    expect(body).toHaveProperty('clientSecret')
    expect(typeof body.clientSecret).toBe('string')
  })

  test('negative: no auth returns 401', async () => {
    await expect(order.createPaymentIntent(null, 100000)).rejects.toMatchObject({ statusCode: 401 })
  })
})
