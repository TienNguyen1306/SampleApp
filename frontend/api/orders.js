const BASE_URL = 'http://localhost:3001'

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

export async function fetchOrders() {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Không thể tải đơn hàng.')
  return data
}
