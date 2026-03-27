const BASE_URL = 'http://localhost:3001'

function getToken() {
  return sessionStorage.getItem('token')
}

export async function fetchUsers(params = {}) {
  const query = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE_URL}/api/users${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Không thể tải danh sách user.')
  return data
}

export async function createUserRequest(userData) {
  const res = await fetch(`${BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(userData),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Không thể tạo user.')
  return data
}

export async function deleteUsersRequest(ids) {
  const res = await fetch(`${BASE_URL}/api/users`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ ids }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Không thể xoá user.')
  return data
}

export async function updateUserRoleRequest(id, role) {
  const res = await fetch(`${BASE_URL}/api/users/${id}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ role }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Không thể cập nhật quyền.')
  return data
}
