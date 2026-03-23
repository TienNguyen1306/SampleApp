import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchProducts, deleteProductRequest } from '../api/products'
import './AdminProductsPage.css'

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ'
}

export default function AdminProductsPage() {
  const navigate = useNavigate()
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
      setProducts((prev) => prev.filter((p) => p.id !== id))
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
          <button className="back-btn" onClick={() => navigate('/home')}>← Trang chủ</button>
          <div className="admin-logo">
            <span>🛍️</span>
            <span>ShopVN — Quản lý sản phẩm</span>
          </div>
          <button className="btn-add" onClick={() => navigate('/admin/add-product')}>+ Thêm sản phẩm</button>
        </div>
      </header>

      <main className="admin-main">
        <h1 className="admin-title">Danh sách sản phẩm</h1>

        {error && <div className="admin-error">⚠️ {error}</div>}
        {loading && <p className="admin-state">Đang tải...</p>}

        {!loading && products.length === 0 && (
          <p className="admin-state">Chưa có sản phẩm nào.</p>
        )}

        {!loading && products.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Emoji</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Tag</th>
                  <th>Giá</th>
                  <th>Tồn kho</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="td-id">#{p.id}</td>
                    <td className="td-emoji">{p.emoji}</td>
                    <td className="td-name">{p.name}</td>
                    <td>{p.category}</td>
                    <td><span className={`tag tag-${p.tag?.toLowerCase()}`}>{p.tag}</span></td>
                    <td className="td-price">{formatPrice(p.price)}</td>
                    <td>{p.stock}</td>
                    <td className="td-actions">
                      {confirmId === p.id ? (
                        <div className="confirm-row">
                          <span className="confirm-text">Xác nhận xóa?</span>
                          <button
                            className="btn-confirm-delete"
                            onClick={() => handleDelete(p.id)}
                            disabled={deletingId === p.id}
                          >
                            {deletingId === p.id ? '...' : 'Xóa'}
                          </button>
                          <button className="btn-cancel" onClick={() => setConfirmId(null)}>Hủy</button>
                        </div>
                      ) : (
                        <button className="btn-delete" onClick={() => setConfirmId(p.id)}>🗑 Xóa</button>
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
