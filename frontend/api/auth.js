const BASE_URL = 'http://localhost:3001'

export async function loginRequest(username, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Đăng nhập thất bại.')
  }

  return data // { token, user }
}

export async function registerRequest(username, password, name, avatarFile = null) {
  const formData = new FormData()
  formData.append('username', username)
  formData.append('password', password)
  formData.append('name', name)
  if (avatarFile) formData.append('avatar', avatarFile)

  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    // Do NOT set Content-Type — browser sets multipart/form-data with boundary automatically
    body: formData,
  })

  const data = await res.json()

  if (!res.ok) {
    const err = new Error(data.message || data.errorCode || 'Đăng ký thất bại.')
    err.errorCode = data.errorCode
    throw err
  }

  return data // { token, user }
}
