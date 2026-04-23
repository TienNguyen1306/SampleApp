import { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchOrders, deleteOrder, deleteAllOrders } from '../api/orders'
import './OrdersPage.css'

const PAGE_SIZE_OPTIONS = [5, 10, 20]

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

  // Filter / search state
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')

  // Pagination state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // Data state
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Delete state
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  // Delete-all state
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)
  const [deletingAll, setDeletingAll] = useState(false)

  const loadOrders = useCallback(() => {
    setLoading(true)
    setError('')
    fetchOrders({ page, limit, search, status: statusFilter, paymentMethod: paymentFilter })
      .then(({ orders: list, pagination: pg }) => {
        setOrders(list)
        setPagination(pg)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [page, limit, search, statusFilter, paymentFilter])

  useEffect(() => { loadOrders() }, [loadOrders])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [search, statusFilter, paymentFilter, limit])

  // Search on Enter or button click
  function handleSearch() {
    setSearch(searchInput.trim())
  }

  function handleSearchKey(e) {
    if (e.key === 'Enter') handleSearch()
  }

  function handleClearSearch() {
    setSearchInput('')
    setSearch('')
  }

  async function handleDelete(id) {
    setDeletingId(id)
    try {
      await deleteOrder(id)
      setConfirmDeleteId(null)
      loadOrders()
    } catch (err) {
      alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  async function handleDeleteAll() {
    setDeletingAll(true)
    try {
      const { deleted } = await deleteAllOrders({ search, status: statusFilter, paymentMethod: paymentFilter })
      setConfirmDeleteAll(false)
      setPage(1)
      loadOrders()
      alert(t('orders.deleteAllSuccess', { count: deleted }))
    } catch (err) {
      alert(err.message)
    } finally {
      setDeletingAll(false)
    }
  }

  const statusOptions = [
    { value: '', label: t('orders.filterAllStatus') },
    { value: 'pending', label: t('orders.statusPending') },
    { value: 'confirmed', label: t('orders.statusConfirmed') },
    { value: 'shipped', label: t('orders.statusShipped') },
    { value: 'delivered', label: t('orders.statusDelivered') },
  ]

  const paymentOptions = [
    { value: '', label: t('orders.filterAllPayment') },
    { value: 'cash', label: t('orders.paymentCash') },
    { value: 'card', label: t('orders.paymentCard') },
  ]

  const statusClass = {
    pending: 'pending',
    confirmed: 'confirmed',
    shipped: 'shipped',
    delivered: 'delivered',
  }

  return (
    <div className="orders-wrapper">
      <header className="orders-header">
        <div className="orders-header-inner">
          <Link to="/home" className="orders-logo">
            <span>🛍️</span>
            <span>ShopVN</span>
          </Link>
          <nav className="orders-nav">
            <Link to="/home">{t('home.nav.home')}</Link>
          </nav>
          <button className="back-btn" onClick={() => navigate(-1)}>{t('orders.back')}</button>
        </div>
      </header>

      <main className="orders-main">
        <h1 className="orders-title" data-testid="orders-title">{t('orders.title')}</h1>

        {/* Search & Filter Bar */}
        <div className="orders-toolbar">
          <div className="orders-search">
            <input
              type="text"
              className="search-input"
              placeholder={t('orders.searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKey}
              data-testid="orders-search-input"
            />
            {searchInput && (
              <button className="search-clear-btn" onClick={handleClearSearch} aria-label="Clear">✕</button>
            )}
            <button className="search-btn" onClick={handleSearch} data-testid="orders-search-btn">
              🔍
            </button>
          </div>

          <div className="orders-filters">
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              data-testid="orders-filter-status"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <select
              className="filter-select"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              data-testid="orders-filter-payment"
            >
              {paymentOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <select
              className="filter-select"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              data-testid="orders-page-size"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{t('orders.perPage', { n })}</option>
              ))}
            </select>
          </div>
        </div>

        {loading && <p className="orders-state">{t('orders.loading')}</p>}
        {error && <p className="orders-state error">{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="orders-empty">
            <span className="empty-icon">📦</span>
            <p>{search || statusFilter || paymentFilter ? t('orders.noResults') : t('orders.empty')}</p>
            {!search && !statusFilter && !paymentFilter && (
              <button className="btn-primary" onClick={() => navigate('/home')}>{t('orders.shopNow')}</button>
            )}
          </div>
        )}

        {orders.length > 0 && (
          <>
            <div className="orders-summary">
              <span>{t('orders.showing', { from: (page - 1) * limit + 1, to: Math.min(page * limit, pagination.total), total: pagination.total })}</span>
              <button
                className="btn-delete-all"
                onClick={() => setConfirmDeleteAll(true)}
                data-testid="delete-all-btn"
              >
                🗑️ {t('orders.deleteAll', { count: pagination.total })}
              </button>
            </div>

            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id || order.id} className="order-card" data-testid="order-card">
                  <div className="order-card-header">
                    <div className="order-meta">
                      <span className="order-id">{t('orders.orderPrefix')}{order._id || order.id}</span>
                      <span className="order-date">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="order-card-header-right">
                      <span className={`order-status ${statusClass[order.status] || 'confirmed'}`}>
                        {t(`orders.status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`)}
                      </span>
                      <button
                        className="delete-btn"
                        title={t('orders.deleteOrder')}
                        onClick={() => setConfirmDeleteId(order._id || order.id)}
                        data-testid="order-delete-btn"
                      >
                        🗑️
                      </button>
                    </div>
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

            {/* Pagination */}
            <div className="orders-pagination" data-testid="orders-pagination">
              <button
                className="page-btn"
                onClick={() => setPage(1)}
                disabled={page === 1}
                title={t('orders.firstPage')}
              >«</button>
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                data-testid="orders-prev-btn"
              >{t('orders.prev')}</button>

              <span className="page-info">
                {t('orders.page', { page, total: pagination.totalPages })}
              </span>

              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                data-testid="orders-next-btn"
              >{t('orders.next')}</button>
              <button
                className="page-btn"
                onClick={() => setPage(pagination.totalPages)}
                disabled={page === pagination.totalPages}
                title={t('orders.lastPage')}
              >»</button>
            </div>
          </>
        )}
      </main>

      {/* Delete Single Confirm Modal */}
      {confirmDeleteId && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <p className="modal-msg">🗑️ {t('orders.deleteConfirm')}</p>
            <div className="modal-actions">
              <button
                className="btn-danger"
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={!!deletingId}
                data-testid="confirm-delete-btn"
              >
                {deletingId ? t('orders.deleting') : t('orders.deleteOrder')}
              </button>
              <button className="btn-secondary" onClick={() => setConfirmDeleteId(null)}>
                {t('orders.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirm Modal */}
      {confirmDeleteAll && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteAll(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <p className="modal-msg">🗑️ {t('orders.deleteAllConfirm', { count: pagination.total })}</p>
            <div className="modal-actions">
              <button
                className="btn-danger"
                onClick={handleDeleteAll}
                disabled={deletingAll}
                data-testid="confirm-delete-all-btn"
              >
                {deletingAll ? t('orders.deletingAll') : t('orders.deleteAll', { count: pagination.total })}
              </button>
              <button className="btn-secondary" onClick={() => setConfirmDeleteAll(false)} data-testid="cancel-delete-all-btn">
                {t('orders.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
