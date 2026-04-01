const BASE_URL = ''

function getToken() {
  return sessionStorage.getItem('token')
}

function getAuthHeaders() {
  return { Authorization: `Bearer ${getToken()}` }
}

function throwApiError(data, fallbackCode = 'UNKNOWN') {
  const err = new Error(data.errorCode || fallbackCode)
  err.errorCode = data.errorCode || fallbackCode
  throw err
}

export async function fetchProfile() {
  const res = await fetch(`${BASE_URL}/api/profile`, {
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throwApiError(data)
  return data
}

export async function updateProfile(name, avatarFile) {
  const formData = new FormData()
  if (name !== undefined) formData.append('name', name)
  if (avatarFile) formData.append('avatar', avatarFile)

  const res = await fetch(`${BASE_URL}/api/profile`, {
    method: 'PATCH',
    headers: getAuthHeaders(), // Do NOT set Content-Type — browser sets multipart boundary
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throwApiError(data)
  return data
}
