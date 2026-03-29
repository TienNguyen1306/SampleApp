/**
 * Shared HTTP client for ShopVN API
 */

export const BASE_URL = 'http://localhost:3001'

// Secret key for private user management APIs — must match backend APP_SECRET
export const APP_KEY = process.env.APP_SECRET || 'shopvn-app-secret-2024'

/**
 * Build common headers.
 * @param {string|null} token - JWT Bearer token
 * @param {boolean} withAppKey - include X-App-Key header (for /api/users routes)
 * @param {boolean} withJson - include Content-Type: application/json
 */
export function buildHeaders(token = null, withAppKey = false, withJson = true) {
  const headers = {}
  if (withJson) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (withAppKey) headers['X-App-Key'] = APP_KEY
  return headers
}

/**
 * Generic fetch wrapper — throws an error with `errorCode` on non-2xx responses.
 */
export async function request(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, options)
  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data.errorCode || data.message || 'Request failed')
    err.errorCode = data.errorCode
    err.statusCode = res.status
    throw err
  }
  return data
}
