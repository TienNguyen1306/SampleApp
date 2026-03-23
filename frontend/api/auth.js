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

export async function registerRequest(username, password, name) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, name }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Đăng ký thất bại.')
  }

  return data // { token, user }
}
