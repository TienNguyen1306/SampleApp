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
 * @param {string} token
 * @returns {Array<Order>}
 */
export async function getOrders(token) {
  return request('/api/orders', {
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
