const BASE_URL = ''

function getToken() {
  return sessionStorage.getItem('token')
}

export async function createPaymentIntent(amount) {
  const res = await fetch(`${BASE_URL}/api/orders/payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ amount }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Không thể tạo payment intent.')
  return data
}

export async function placeOrder(orderData) {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(orderData),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Không thể đặt hàng.')
  return data
}

export async function fetchOrders({ page = 1, limit = 10, search = '', status = '', paymentMethod = '' } = {}) {
  const params = new URLSearchParams({ page, limit })
  if (search) params.set('search', search)
  if (status) params.set('status', status)
  if (paymentMethod) params.set('paymentMethod', paymentMethod)

  const res = await fetch(`${BASE_URL}/api/orders?${params.toString()}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Không thể tải đơn hàng.')
  return data
}

export async function deleteOrder(id) {
  const res = await fetch(`${BASE_URL}/api/orders/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Không thể xoá đơn hàng.')
  return data
}
