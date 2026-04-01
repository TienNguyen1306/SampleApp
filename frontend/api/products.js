const BASE_URL = ''

function getToken() {
  return sessionStorage.getItem('token')
}

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE_URL}/api/products${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Không thể tải sản phẩm.')
  }

  return data
}

export async function createProductRequest(productData) {
  const res = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(productData),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Không thể thêm sản phẩm.')
  }

  return data
}

export async function deleteProductRequest(id) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Không thể xóa sản phẩm.')
  }

  return data
}
