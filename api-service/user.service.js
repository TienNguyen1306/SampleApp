/**
 * User Management Service — /api/users
 * ⚠️  Private API: requires token (admin) + X-App-Key header
 *
 * Endpoints:
 *   GET    /api/users              — list users (with search/filter/sort/paging)
 *   POST   /api/users              — create a new user
 *   DELETE /api/users              — bulk delete users by IDs
 *   PATCH  /api/users/:id/role     — update a user's role
 */

import { buildHeaders, request } from './client.js'

const withAppKey = true

/**
 * Get paginated list of users.
 * @param {string} token - admin JWT
 * @param {{
 *   search?: string,
 *   role?: 'admin' | 'customer',
 *   sortBy?: 'username' | 'name' | 'createdAt',
 *   sortDir?: 'asc' | 'desc',
 *   page?: number,
 *   limit?: number
 * }} params
 * @returns {{ users: Array<User>, total: number, totalPages: number, page: number }}
 */
export async function getUsers(token, params = {}) {
  const query = new URLSearchParams(params).toString()
  const url = `/api/users${query ? `?${query}` : ''}`
  return request(url, {
    headers: buildHeaders(token, withAppKey, false),
  })
}

/**
 * Create a new user (admin only).
 * @param {string} token - admin JWT
 * @param {{ username: string, password: string, name: string, role: 'admin' | 'customer' }} userData
 * @returns {User}
 */
export async function createUser(token, userData) {
  return request('/api/users', {
    method: 'POST',
    headers: buildHeaders(token, withAppKey),
    body: JSON.stringify(userData),
  })
}

/**
 * Bulk delete users by IDs (admin only).
 * @param {string} token - admin JWT
 * @param {string[]} ids - array of user _id strings
 * @returns {{ deleted: number }}
 */
export async function deleteUsers(token, ids) {
  return request('/api/users', {
    method: 'DELETE',
    headers: buildHeaders(token, withAppKey),
    body: JSON.stringify({ ids }),
  })
}

/**
 * Update a user's role (admin only). Cannot change the main admin account.
 * @param {string} token - admin JWT
 * @param {string} id - user _id
 * @param {'admin' | 'customer'} role
 * @returns {User}
 */
export async function updateUserRole(token, id, role) {
  return request(`/api/users/${id}/role`, {
    method: 'PATCH',
    headers: buildHeaders(token, withAppKey),
    body: JSON.stringify({ role }),
  })
}
