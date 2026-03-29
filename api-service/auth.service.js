/**
 * Auth Service — /api/auth
 *
 * Endpoints:
 *   POST /api/auth/login
 *   POST /api/auth/register  (multipart/form-data, optional avatar)
 *   GET  /api/auth/me        (requires token)
 */

import { BASE_URL, buildHeaders, request } from './client.js'

/**
 * Login with username and password.
 * @returns {{ token: string, user: { id, username, name, role, avatar } }}
 */
export async function login(username, password) {
  return request('/api/auth/login', {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ username, password }),
  })
}

/**
 * Register a new user account.
 * @param {string} username
 * @param {string} password
 * @param {string} name
 * @param {Blob|File|null} avatarFile - optional profile image (< 5MB)
 * @returns {{ token: string, user: { id, username, name, role, avatar } }}
 */
export async function register(username, password, name, avatarFile = null) {
  const formData = new FormData()
  formData.append('username', username)
  formData.append('password', password)
  formData.append('name', name)
  if (avatarFile) formData.append('avatar', avatarFile)

  // Do NOT set Content-Type — let browser/fetch set multipart boundary automatically
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data.errorCode || data.message || 'Registration failed')
    err.errorCode = data.errorCode
    err.statusCode = res.status
    throw err
  }
  return data
}

/**
 * Get the currently authenticated user's info.
 * @param {string} token - JWT Bearer token
 * @returns {{ id, username, name, role, avatar }}
 */
export async function getMe(token) {
  return request('/api/auth/me', {
    headers: buildHeaders(token),
  })
}
