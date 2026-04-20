/**
 * Order Service — /api/orders
 *
 * Endpoints:
 *   GET  /api/orders                  (requires token) — get order history
 *   POST /api/orders                  (requires token) — place a new order
 *   POST /api/orders/payment-intent   (requires token) — create Stripe payment intent
 */

import { buildHeaders, request } from './client.js'

/**
 * Get order history for the authenticated user.
 * @param {string|null} token
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   search?: string,
 *   status?: string,
 *   paymentMethod?: string
 * }} params
 * @returns {{ orders: Array<Order>, pagination: { page: number, limit: number, total: number, totalPages: number } }}
 */
export async function getOrders(token, params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== '')
    )
  ).toString()
  const url = `/api/orders${query ? `?${query}` : ''}`
  return request(url, {
    headers: buildHeaders(token),
  })
}

/**
 * Delete an order (owner-only).
 * @param {string} token
 * @param {string} id - order _id
 * @returns {{ message: string }}
 */
export async function deleteOrder(token, id) {
  return request(`/api/orders/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  })
}

/**
 * Place a new order.
 * @param {string} token
 * @param {{
 *   items: Array<{ productId: string, name: string, price: number, quantity: number }>,
 *   recipient: string,
 *   phone: string,
 *   address: string,
 *   paymentMethod: 'cash' | 'card',
 *   total: number
 * }} orderData
 * @returns {{ orderId: string }}
 */
export async function placeOrder(token, orderData) {
  return request('/api/orders', {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(orderData),
  })
}

/**
 * Delete all orders matching optional filters (owner-only).
 * @param {string} token
 * @param {{ search?: string, status?: string, paymentMethod?: string }} params
 * @returns {{ message: string, deleted: number }}
 */
export async function deleteAllOrders(token, params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== '')
    )
  ).toString()
  const url = `/api/orders${query ? `?${query}` : ''}`
  return request(url, {
    method: 'DELETE',
    headers: buildHeaders(token),
  })
}

/**
 * Create a Stripe payment intent (used before placing a card order).
 * @param {string} token
 * @param {number} amount - amount in smallest currency unit (e.g. cents)
 * @returns {{ clientSecret: string }}
 */
export async function createPaymentIntent(token, amount) {
  return request('/api/orders/payment-intent', {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify({ amount }),
  })
}
