import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchOrders } from '../api/orders'
import './OrdersPage.css'

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ'
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="orders-wrapper">
      <header className="orders-header">
        <div className="orders-header-inner">
          <button className="back-btn" onClick={() => navigate('/home')}>{t('orders.back')}</button>
          <div className="orders-logo">
            <span>🛍️</span>
            <span>ShopVN</span>
          </div>
        </div>
      </header>

      <main className="orders-main">
        <h1 className="orders-title">{t('orders.title')}</h1>

        {loading && <p className="orders-state">{t('orders.loading')}</p>}
        {error && <p className="orders-state error">{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="orders-empty">
            <span className="empty-icon">📦</span>
            <p>{t('orders.empty')}</p>
            <button className="btn-primary" onClick={() => navigate('/home')}>{t('orders.shopNow')}</button>
          </div>
        )}

        {orders.length > 0 && (
          <div className="orders-list">
            {[...orders].reverse().map((order) => (
              <div key={order._id || order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-meta">
                    <span className="order-id">{t('orders.orderPrefix')}{order._id || order.id}</span>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                  </div>
                  <span className="order-status confirmed">{t('orders.confirmed')}</span>
                </div>

                <div className="order-items">
                  {order.items.map((item, idx) => (
                    <div key={item._id || item.id || idx} className="order-item">
                      <span className="order-item-emoji">{item.emoji}</span>
                      <span className="order-item-name">{item.name}</span>
                      <span className="order-item-qty">×{item.quantity}</span>
                      <span className="order-item-price">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div className="order-recipient">
                    <span>👤 {order.recipientName}</span>
                    <span>📍 {order.address}</span>
                  </div>
                  <div className="order-footer-right">
                    <span className="order-payment">
                      {order.paymentMethod === 'card' ? t('orders.paymentCard') : t('orders.paymentCash')}
                    </span>
                    <span className="order-total">{formatPrice(order.totalPrice)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
