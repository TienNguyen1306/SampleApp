/**
 * Product Service — /api/products
 *
 * Endpoints:
 *   GET    /api/products        (requires token)
 *   GET    /api/products/:id    (requires token)
 *   POST   /api/products        (requires token + admin)
 *   DELETE /api/products/:id    (requires token + admin)
 */

import { buildHeaders, request } from './client.js'

/**
 * Get all products.
 * @param {string} token
 * @returns {Array<{ _id, name, price, emoji, tag, category, stock }>}
 */
export async function getProducts(token) {
  return request('/api/products', {
    headers: buildHeaders(token),
  })
}

/**
 * Get a single product by ID.
 * @param {string} token
 * @param {string} id - product _id
 * @returns {{ _id, name, price, emoji, tag, category, stock }}
 */
export async function getProductById(token, id) {
  return request(`/api/products/${id}`, {
    headers: buildHeaders(token),
  })
}

/**
 * Add a new product (admin only).
 * @param {string} token
 * @param {{ name: string, price: number, emoji: string, tag: string, category: string, stock: number }} productData
 * @returns {{ _id, name, price, emoji, tag, category, stock }}
 */
export async function addProduct(token, productData) {
  return request('/api/products', {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(productData),
  })
}

/**
 * Delete a product by ID (admin only).
 * @param {string} token
 * @param {string} id - product _id
 * @returns {{ message: string }}
 */
export async function deleteProduct(token, id) {
  return request(`/api/products/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  })
}
