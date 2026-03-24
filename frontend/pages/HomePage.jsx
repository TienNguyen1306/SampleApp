import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchProducts } from '../api/products'
import { useCart } from '../context/CartContext'
import './HomePage.css'

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ'
}

export default function HomePage() {
  const navigate = useNavigate()
  const { addToCart, totalCount } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addedId, setAddedId] = useState(null)
  const user = JSON.parse(sessionStorage.getItem('user') || 'null')

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleAddToCart = (product) => {
    addToCart(product)
    setAddedId(product._id || product.id)
    setTimeout(() => setAddedId(null), 800)
  }

  const handleLogout = () => {
    sessionStorage.clear()
    navigate('/login')
  }

  return (
    <div className="home-wrapper">
      <header className="home-header">
        <div className="header-inner">
          <div className="header-logo">
            <span>🛍️</span>
            <span className="header-logo-name">ShopVN</span>
          </div>
          <nav className="header-nav">
            <a href="#">Trang chủ</a>
            <a href="#">Sản phẩm</a>
            <a href="#">Khuyến mãi</a>
          </nav>
          <div className="header-right">
            {user && <span className="header-user">Xin chào, <strong>{user.name}</strong></span>}
            {user?.role === 'admin' && (
              <button className="admin-btn" onClick={() => navigate('/admin/products')}>
                ⚙️ Quản lý SP
              </button>
            )}
            <button className="orders-btn" onClick={() => navigate('/orders')}>📦 Đơn hàng</button>
            <button className="cart-btn" onClick={() => navigate('/cart')}>
              🛒
              {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
            </button>
            <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
          </div>
        </div>
      </header>

      <section className="home-banner">
        <div className="banner-content">
          <h1>Mua sắm thả ga 🎉</h1>
          <p>Hàng ngàn sản phẩm chính hãng, giao hàng toàn quốc</p>
          <button className="banner-btn">Khám phá ngay</button>
        </div>
      </section>

      <main className="home-main">
        <h2 className="section-title">Sản phẩm nổi bật</h2>

        {loading && <p className="state-msg">Đang tải sản phẩm...</p>}
        {error && <p className="state-msg error">{error}</p>}

        {!loading && !error && (
          <div className="product-grid">
            {products.map((p) => (
              <div key={p._id || p.id} className="product-card">
                <div className="product-img">{p.emoji}</div>
                <span className={`product-tag tag-${p.tag.toLowerCase()}`}>{p.tag}</span>
                <h3 className="product-name">{p.name}</h3>
                <p className="product-price">{formatPrice(p.price)}</p>
                <button
                  className={`add-to-cart ${addedId === (p._id || p.id) ? 'added' : ''}`}
                  onClick={() => handleAddToCart(p)}
                >
                  {addedId === (p._id || p.id) ? '✓ Đã thêm' : 'Thêm vào giỏ 🛒'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="home-footer">
        <p>© 2024 ShopVN. All rights reserved.</p>
      </footer>
    </div>
  )
}
