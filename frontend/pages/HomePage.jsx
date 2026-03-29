import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchProducts } from '../api/products'
import { useCart } from '../context/CartContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import './HomePage.css'

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ'
}

export default function HomePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
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
            <a href="#">{t('home.nav.products')}</a>
            <a href="#">{t('home.nav.promotions')}</a>
          </nav>
          <div className="header-right">
            {user && (
              <Link to="/profile" className="header-profile-link" data-testid="header-profile-link">
                {user.avatar
                  ? <img src={user.avatar} alt="avatar" className="header-avatar" data-testid="header-avatar" />
                  : <span className="header-avatar-placeholder" data-testid="header-avatar-placeholder">👤</span>
                }
                <span className="header-user" data-testid="header-username">{t('home.greeting')} <strong>{user.name}</strong></span>
              </Link>
            )}
            {user?.role === 'admin' && (
              <>
                <button className="admin-btn" data-testid="admin-products-btn" onClick={() => navigate('/admin/products')}>
                  {t('home.adminProducts')}
                </button>
                <button className="admin-btn" data-testid="admin-users-btn" onClick={() => navigate('/admin/users')}>
                  {t('home.adminUsers')}
                </button>
              </>
            )}
            <button className="orders-btn" onClick={() => navigate('/orders')}>{t('home.orders')}</button>
            <button className="cart-btn" onClick={() => navigate('/cart')}>
              🛒
              {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
            </button>
            <button className="logout-btn" data-testid="logout-btn" onClick={handleLogout}>{t('home.logout')}</button>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <section className="home-banner">
        <div className="banner-content">
          <h1>{t('home.hero.title')}</h1>
          <p>{t('home.hero.subtitle')}</p>
          <button className="banner-btn">{t('home.hero.cta')}</button>
        </div>
      </section>

      <main className="home-main">
        <h2 className="section-title">{t('home.featured')}</h2>

        {loading && <p className="state-msg">{t('home.loading')}</p>}
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
                  {addedId === (p._id || p.id) ? t('home.added') : t('home.addToCart')}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="home-footer">
        <p>{t('home.footer')}</p>
      </footer>
    </div>
  )
}
