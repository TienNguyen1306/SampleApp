const BASE_URL = 'http://localhost:3001'

// Secret key xác minh request đến từ app nội bộ
// Phải khớp với APP_SECRET trong backend/config.js
const APP_KEY = import.meta.env.VITE_APP_SECRET || 'shopvn-app-secret-2024'

function getToken() {
  return sessionStorage.getItem('token')
}

function getHeaders(extra = {}) {
  return {
    'X-App-Key': APP_KEY,
    Authorization: `Bearer ${getToken()}`,
    ...extra,
  }
}

// Throw an error with errorCode so the frontend can translate it
function throwApiError(data, fallbackCode = 'UNKNOWN') {
  const err = new Error(data.errorCode || fallbackCode)
  err.errorCode = data.errorCode || fallbackCode
  throw err
}

export async function fetchUsers(params = {}) {
  const query = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE_URL}/api/users${query ? `?${query}` : ''}`, {
    headers: getHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throwApiError(data)
  return data
}

export async function createUserRequest(userData) {
  const res = await fetch(`${BASE_URL}/api/users`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(userData),
  })
  const data = await res.json()
  if (!res.ok) throwApiError(data)
  return data
}

export async function deleteUsersRequest(ids) {
  const res = await fetch(`${BASE_URL}/api/users`, {
    method: 'DELETE',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ ids }),
  })
  const data = await res.json()
  if (!res.ok) throwApiError(data)
  return data
}

export async function updateUserRoleRequest(id, role) {
  const res = await fetch(`${BASE_URL}/api/users/${id}/role`, {
    method: 'PATCH',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ role }),
  })
  const data = await res.json()
  if (!res.ok) throwApiError(data)
  return data
}
