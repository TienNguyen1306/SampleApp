import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchProducts, deleteProductRequest } from '../api/products'
import './AdminProductsPage.css'

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ'
}

export default function AdminProductsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await deleteProductRequest(id)
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  return (
    <div className="admin-products-wrapper">
      <header className="admin-header">
        <div className="admin-header-inner">
          <button className="back-btn" onClick={() => navigate('/home')}>{t('admin.back')}</button>
          <div className="admin-logo">
            <span>🛍️</span>
            <span>ShopVN — {t('admin.title')}</span>
          </div>
          <button className="btn-add" onClick={() => navigate('/admin/add-product')}>{t('admin.addProduct')}</button>
        </div>
      </header>

      <main className="admin-main">
        <h1 className="admin-title">{t('admin.title')}</h1>

        {error && <div className="admin-error">⚠️ {error}</div>}
        {loading && <p className="admin-state">{t('admin.loading')}</p>}

        {!loading && products.length === 0 && (
          <p className="admin-state">{t('admin.noProducts')}</p>
        )}

        {!loading && products.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Emoji</th>
                  <th>{t('addProduct.name')}</th>
                  <th>{t('addProduct.category')}</th>
                  <th>{t('addProduct.tag')}</th>
                  <th>{t('addProduct.price')}</th>
                  <th>{t('addProduct.stock')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id || p.id}>
                    <td className="td-id">#{(p._id || p.id)?.toString().slice(-6)}</td>
                    <td className="td-emoji">{p.emoji}</td>
                    <td className="td-name">{p.name}</td>
                    <td>{p.category}</td>
                    <td><span className={`tag tag-${p.tag?.toLowerCase()}`}>{p.tag}</span></td>
                    <td className="td-price">{formatPrice(p.price)}</td>
                    <td>{p.stock}</td>
                    <td className="td-actions">
                      {confirmId === (p._id || p.id) ? (
                        <div className="confirm-row">
                          <span className="confirm-text">{t('admin.deleteConfirm')}</span>
                          <button
                            className="btn-confirm-delete"
                            onClick={() => handleDelete(p._id || p.id)}
                            disabled={deletingId === (p._id || p.id)}
                          >
                            {deletingId === (p._id || p.id) ? '...' : t('admin.delete')}
                          </button>
                          <button className="btn-cancel" onClick={() => setConfirmId(null)}>{t('addProduct.cancel')}</button>
                        </div>
                      ) : (
                        <button className="btn-delete" onClick={() => setConfirmId(p._id || p.id)}>🗑 {t('admin.delete')}</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
