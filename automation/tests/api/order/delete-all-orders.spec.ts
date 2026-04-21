import { test, expect } from '@playwright/test'
import * as auth from '../../../api-services/auth.service.js'
import * as order from '../../../api-services/order.service.js'
import * as userService from '../../../api-services/user.service.js'

const TEST_USER = { username: 'delete_all_spec_user', password: 'pass123456', name: 'Delete All Spec User', role: 'customer' }

const SAMPLE_ORDER = {
  items: [{ productId: '000000000000000000000001', name: 'Áo thun', price: 199000, emoji: '👕', quantity: 1 }],
  recipientName: 'Test User',
  recipientPhone: '0912345678',
  address: '1 Đường Test',
  paymentMethod: 'cash',
  totalPrice: 199000,
}

test.describe('DELETE /api/orders (delete-all)', () => {
  test.describe.configure({ mode: 'serial' })

  let userToken: string
  let userId: string

  test.beforeAll(async () => {
    // Create a dedicated test user so we don't pollute admin orders
    const { token: adminToken } = await auth.login('admin', 'password123')
    const created = await userService.createUser(adminToken, TEST_USER)
    userId = created._id || created.id
    const { token } = await auth.login(TEST_USER.username, TEST_USER.password)
    userToken = token
  })

  test.afterAll(async () => {
    // Clean up test user
    const { token: adminToken } = await auth.login('admin', 'password123')
    await userService.deleteUsers(adminToken, [userId])
  })

  test.beforeEach(async () => {
    // Place 3 orders: 2 cash, 1 card — so filter tests are meaningful
    await order.placeOrder(userToken, { ...SAMPLE_ORDER, paymentMethod: 'cash' })
    await order.placeOrder(userToken, { ...SAMPLE_ORDER, paymentMethod: 'cash', recipientName: 'Cash User 2' })
    await order.placeOrder(userToken, { ...SAMPLE_ORDER, paymentMethod: 'card', paymentIntentId: 'mock_pi', recipientName: 'Card User' })
  })

  test.afterEach(async () => {
    // Wipe all remaining orders for this user
    await order.deleteAllOrders(userToken)
  })

  test('positive: deletes all orders without filter', async () => {
    const before = await order.getOrders(userToken)
    expect(before.pagination.total).toBeGreaterThanOrEqual(3)

    const result = await order.deleteAllOrders(userToken)
    expect(result.message).toBe('OK')
    expect(result.deleted).toBeGreaterThanOrEqual(3)

    const after = await order.getOrders(userToken)
    expect(after.pagination.total).toBe(0)
  })

  test('positive: deletes only orders matching paymentMethod filter', async () => {
    const result = await order.deleteAllOrders(userToken, { paymentMethod: 'cash' })
    expect(result.message).toBe('OK')
    expect(result.deleted).toBe(2)

    // Card order should still exist
    const after = await order.getOrders(userToken)
    expect(after.pagination.total).toBe(1)
    expect(after.orders[0].paymentMethod).toBe('card')
  })

  test('positive: deletes only orders matching search filter', async () => {
    const result = await order.deleteAllOrders(userToken, { search: 'Card User' })
    expect(result.message).toBe('OK')
    expect(result.deleted).toBe(1)

    // 2 cash orders should remain
    const after = await order.getOrders(userToken)
    expect(after.pagination.total).toBe(2)
  })

  test('positive: returns deleted=0 when no orders match filter', async () => {
    const result = await order.deleteAllOrders(userToken, { status: 'shipped' })
    expect(result.message).toBe('OK')
    expect(result.deleted).toBe(0)
  })

  test('negative: no auth returns 401', async () => {
    await expect(order.deleteAllOrders(null)).rejects.toMatchObject({ statusCode: 401 })
  })
})
