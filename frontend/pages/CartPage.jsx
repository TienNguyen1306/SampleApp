import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './CartPage.css'

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ'
}

export default function CartPage() {
  const navigate = useNavigate()
  const { items, updateQuantity, totalCount, totalPrice } = useCart()

  return (
    <div className="cart-wrapper">
      <header className="cart-header">
        <div className="cart-header-inner">
          <button className="back-btn" onClick={() => navigate('/home')}>← Tiếp tục mua sắm</button>
          <div className="cart-logo">
            <span>🛍️</span>
            <span>ShopVN</span>
          </div>
        </div>
      </header>

      <main className="cart-main">
        <h1 className="cart-title">Giỏ hàng của bạn ({totalCount} sản phẩm)</h1>

        {items.length === 0 ? (
          <div className="cart-empty">
            <span className="empty-icon">🛒</span>
            <p>Giỏ hàng trống</p>
            <button className="shop-btn" onClick={() => navigate('/home')}>Mua sắm ngay</button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="cart-item">
                  <div className="item-emoji">{product.emoji}</div>
                  <div className="item-info">
                    <h3 className="item-name">{product.name}</h3>
                    <p className="item-category">{product.category}</p>
                    <p className="item-unit-price">{formatPrice(product.price)} / cái</p>
                  </div>
                  <div className="item-qty">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(product.id, -1)}
                    >−</button>
                    <span className="qty-value">{quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(product.id, 1)}
                    >+</button>
                  </div>
                  <div className="item-total">
                    {formatPrice(product.price * quantity)}
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => updateQuantity(product.id, -quantity)}
                    title="Xóa"
                  >✕</button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Tổng đơn hàng</h2>
              <div className="summary-row">
                <span>Tạm tính ({totalCount} sản phẩm)</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span className="free">Miễn phí</span>
              </div>
              <div className="summary-total">
                <span>Tổng cộng</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <button className="checkout-btn" onClick={() => navigate('/checkout')}>Thanh toán ngay</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
