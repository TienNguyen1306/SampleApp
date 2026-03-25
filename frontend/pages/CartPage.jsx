import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import './CartPage.css'

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ'
}

export default function CartPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { items, updateQuantity, totalCount, totalPrice } = useCart()

  return (
    <div className="cart-wrapper">
      <header className="cart-header">
        <div className="cart-header-inner">
          <button className="back-btn" onClick={() => navigate('/home')}>{t('cart.back')}</button>
          <div className="cart-logo">
            <span>🛍️</span>
            <span>ShopVN</span>
          </div>
        </div>
      </header>

      <main className="cart-main">
        <h1 className="cart-title">{t('cart.title')} ({totalCount})</h1>

        {items.length === 0 ? (
          <div className="cart-empty">
            <span className="empty-icon">🛒</span>
            <p>{t('cart.empty')}</p>
            <button className="shop-btn" onClick={() => navigate('/home')}>{t('cart.shopNow')}</button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {items.map(({ product, quantity }) => (
                <div key={product._id || product.id} className="cart-item">
                  <div className="item-emoji">{product.emoji}</div>
                  <div className="item-info">
                    <h3 className="item-name">{product.name}</h3>
                    <p className="item-category">{product.category}</p>
                    <p className="item-unit-price">{formatPrice(product.price)} / cái</p>
                  </div>
                  <div className="item-qty">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(product._id || product.id, -1)}
                    >−</button>
                    <span className="qty-value">{quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(product._id || product.id, 1)}
                    >+</button>
                  </div>
                  <div className="item-total">
                    {formatPrice(product.price * quantity)}
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => updateQuantity(product._id || product.id, -quantity)}
                    title={t('cart.remove')}
                  >✕</button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>{t('cart.total')}</h2>
              <div className="summary-row">
                <span>({totalCount})</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="summary-row">
                <span>{t('cart.shipping')}</span>
                <span className="free">{t('cart.shippingFree')}</span>
              </div>
              <div className="summary-total">
                <span>{t('cart.total')}</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <button className="checkout-btn" onClick={() => navigate('/checkout')}>{t('cart.checkout')}</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
