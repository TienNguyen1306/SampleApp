import { test, expect } from '@playwright/test'
import * as auth from '../../../api-services/auth.service.js'
import * as order from '../../../api-services/order.service.js'

test.describe('POST /api/orders', () => {
  let token: string

  test.beforeAll(async () => {
    const { token: t } = await auth.login('admin', 'password123')
    token = t
  })

  const validOrder = {
    items: [{ productId: '000000000000000000000001', name: 'Test', price: 50000, quantity: 1 }],
    recipientName: 'Test User',
    recipientPhone: '0901234567',
    address: '123 Test Street',
    paymentMethod: 'cash' as const,
    totalPrice: 50000,
  }

  test('positive: place order returns 201 with order object', async () => {
    const body = await order.placeOrder(token, validOrder)
    expect(body).toHaveProperty('_id')
    expect(body).toHaveProperty('userId')
    expect(body.status).toBe('confirmed')
    expect(body.recipientName).toBe('Test User')

    // Verify via GET that the order appears in order history
    const orderId = body._id
    const { orders } = await order.getOrders(token)
    const found = orders.find((o: any) => o._id === orderId)
    expect(found).toBeDefined()
    expect(found.recipientName).toBe('Test User')
    expect(found.status).toBe('confirmed')
  })

  test('negative: no auth returns 401', async () => {
    await expect(order.placeOrder(null, validOrder)).rejects.toMatchObject({ statusCode: 401 })
  })
})
