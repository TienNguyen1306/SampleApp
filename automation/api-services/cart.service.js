/**
 * Cart Service — /api/cart
 *
 * Endpoints:
 *   GET /api/cart    (requires token) — get current cart items
 *   PUT /api/cart    (requires token) — replace the entire cart
 */

import { buildHeaders, request } from './client.js'

/**
 * Get the current user's cart items.
 * @param {string} token
 * @returns {Array<{ product: { _id, name, price, emoji }, quantity: number }>}
 */
export async function getCart(token) {
  return request('/api/cart', {
    headers: buildHeaders(token),
  })
}

/**
 * Update (replace) the entire cart.
 * @param {string} token
 * @param {Array<{ productId: string, quantity: number }>} items
 * @returns {Array<{ product: { _id, name, price, emoji }, quantity: number }>}
 */
export async function updateCart(token, items) {
  return request('/api/cart', {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify({ items }),
  })
}
