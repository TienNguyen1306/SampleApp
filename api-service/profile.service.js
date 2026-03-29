/**
 * Profile Service — /api/profile
 *
 * Endpoints:
 *   GET   /api/profile   (requires token) — get current user profile
 *   PATCH /api/profile   (requires token) — update name and/or avatar
 */

import { BASE_URL, buildHeaders, request } from './client.js'

/**
 * Get the authenticated user's full profile.
 * @param {string} token
 * @returns {{ id, username, name, role, avatar: string|null }}
 */
export async function getProfile(token) {
  return request('/api/profile', {
    headers: buildHeaders(token, false, false),
  })
}

/**
 * Update the authenticated user's profile.
 * @param {string} token
 * @param {{ name?: string, avatarFile?: Blob|File|null }} updates
 *   - name: new display name (optional)
 *   - avatarFile: image file < 5MB (optional)
 * @returns {{ id, username, name, role, avatar: string|null }}
 */
export async function updateProfile(token, { name, avatarFile } = {}) {
  const formData = new FormData()
  if (name !== undefined) formData.append('name', name)
  if (avatarFile) formData.append('avatar', avatarFile)

  // Do NOT set Content-Type — let fetch set multipart boundary automatically
  const res = await fetch(`${BASE_URL}/api/profile`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data.errorCode || data.message || 'Update failed')
    err.errorCode = data.errorCode
    err.statusCode = res.status
    throw err
  }
  return data
}
