import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCart } from '../context/CartContext'
import { createPaymentIntent, placeOrder } from '../api/orders'
import './CheckoutPage.css'

// Thay bằng publishable key từ https://dashboard.stripe.com/test/apikeys
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const isMockMode = !STRIPE_PK || STRIPE_PK.includes('YOUR_PUBLISHABLE_KEY')
const stripePromise = isMockMode ? null : loadStripe(STRIPE_PK)

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1a1a2e',
      fontFamily: 'system-ui, sans-serif',
      '::placeholder': { color: '#aaa' },
    },
    invalid: { color: '#e53e3e' },
  },
}

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ'
}

function CheckoutForm({ onSuccess }) {
  const { items, totalPrice, clearCart } = useCart()
  const stripe = useStripe()
  const elements = useElements()

  const [form, setForm] = useState({ recipientName: '', recipientPhone: '', address: '' })
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let paymentIntentId = null

      if (paymentMethod === 'card') {
        const { clientSecret } = await createPaymentIntent(totalPrice)

        // Mock mode: backend trả về clientSecret giả — bỏ qua Stripe confirmation
        if (clientSecret.startsWith('mock_')) {
          paymentIntentId = clientSecret
        } else {
          if (!stripe || !elements) {
            setError('Stripe chưa sẵn sàng, vui lòng thử lại.')
            return
          }
          const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: elements.getElement(CardElement) },
          })
          if (stripeError) {
            setError(stripeError.message)
            return
          }
          paymentIntentId = paymentIntent.id
        }
      }

      const order = await placeOrder({
        items: items.map((i) => ({
          productId: i.product._id || i.product.id,
          name: i.product.name,
          price: i.product.price,
          emoji: i.product.emoji,
          quantity: i.quantity,
        })),
        recipientName: form.recipientName,
        recipientPhone: form.recipientPhone,
        address: form.address,
        paymentMethod,
        paymentIntentId,
        totalPrice,
      })

      clearCart()
      onSuccess(order)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <div className="checkout-section">
        <h2>Thông tin người nhận</h2>
        <div className="form-group">
          <label>Họ và tên</label>
          <input
            name="recipientName"
            placeholder="Nguyễn Văn A"
            value={form.recipientName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Số điện thoại</label>
          <input
            name="recipientPhone"
            placeholder="0912 345 678"
            value={form.recipientPhone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Địa chỉ nhận hàng</label>
          <input
            name="address"
            placeholder="123 Đường ABC, Phường XYZ, TP. HCM"
            value={form.address}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="checkout-section">
        <h2>Phương thức thanh toán</h2>
        <div className="payment-methods">
          <label className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={() => setPaymentMethod('cash')}
            />
            <span className="payment-icon">💵</span>
            <span>Thanh toán khi nhận hàng (COD)</span>
          </label>
          <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={() => setPaymentMethod('card')}
            />
            <span className="payment-icon">💳</span>
            <span>Thanh toán bằng thẻ (Stripe)</span>
          </label>
        </div>

        {paymentMethod === 'card' && (
          <div className="card-element-wrapper">
            <label>Thông tin thẻ</label>
            <div className="card-element-container">
              {isMockMode ? (
                <input
                  type="text"
                  defaultValue="4242 4242 4242 4242"
                  placeholder="Card number (mock mode)"
                  disabled
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', background: '#f9f9f9', color: '#888' }}
                />
              ) : (
                <CardElement options={CARD_ELEMENT_OPTIONS} />
              )}
            </div>
            <p className="card-hint">
              {isMockMode
                ? <>🧪 Mock mode — thanh toán sẽ được xử lý tự động, không cần thẻ thật</>
                : <>Test: <code>4242 4242 4242 4242</code> · MM/YY bất kỳ · CVC bất kỳ</>
              }
            </p>
          </div>
        )}
      </div>

      {error && <div className="checkout-error">⚠️ {error}</div>}

      <button type="submit" className="btn-checkout" disabled={loading}>
        {loading
          ? 'Đang xử lý...'
          : paymentMethod === 'card'
          ? `Thanh toán ${formatPrice(totalPrice)}`
          : `Đặt hàng ${formatPrice(totalPrice)}`}
      </button>
    </form>
  )
}

function OrderSuccess({ order, onContinue }) {
  return (
    <div className="checkout-success">
      <div className="success-icon">✅</div>
      <h2>Đặt hàng thành công!</h2>
      <p>
        Mã đơn hàng: <strong>#{order.id}</strong>
      </p>
      <p>
        Người nhận: <strong>{order.recipientName}</strong>
      </p>
      <p>Địa chỉ: {order.address}</p>
      <p>
        Thanh toán:{' '}
        <strong>{order.paymentMethod === 'card' ? '💳 Thẻ' : '💵 Tiền mặt khi nhận hàng'}</strong>
      </p>
      <p className="success-total">Tổng: {formatPrice(order.totalPrice)}</p>
      <button className="btn-primary" onClick={onContinue}>
        Tiếp tục mua sắm
      </button>
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, totalPrice } = useCart()
  const [successOrder, setSuccessOrder] = useState(null)

  if (!successOrder && items.length === 0) {
    return <Navigate to="/cart" replace />
  }

  if (successOrder) {
    return (
      <div className="checkout-wrapper">
        <header className="checkout-header">
          <div className="checkout-header-inner">
            <div className="checkout-logo">
              <span>🛍️</span>
              <span>ShopVN</span>
            </div>
          </div>
        </header>
        <main className="checkout-main">
          <OrderSuccess order={successOrder} onContinue={() => navigate('/home')} />
        </main>
      </div>
    )
  }

  return (
    <div className="checkout-wrapper">
      <header className="checkout-header">
        <div className="checkout-header-inner">
          <button className="back-btn" onClick={() => navigate('/cart')}>
            ← Quay lại giỏ hàng
          </button>
          <div className="checkout-logo">
            <span>🛍️</span>
            <span>ShopVN</span>
          </div>
        </div>
      </header>

      <main className="checkout-main">
        <div className="checkout-grid">
          <div className="checkout-left">
            <h1 className="checkout-title">Thanh toán</h1>
            {isMockMode ? (
              <CheckoutForm onSuccess={setSuccessOrder} />
            ) : (
              <Elements stripe={stripePromise}>
                <CheckoutForm onSuccess={setSuccessOrder} />
              </Elements>
            )}
          </div>

          <div className="checkout-right">
            <div className="order-summary">
              <h2>Đơn hàng của bạn</h2>
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="summary-item">
                  <span className="summary-emoji">{product.emoji}</span>
                  <span className="summary-name">
                    {product.name} ×{quantity}
                  </span>
                  <span className="summary-price">{formatPrice(product.price * quantity)}</span>
                </div>
              ))}
              <div className="summary-divider" />
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span className="free">Miễn phí</span>
              </div>
              <div className="summary-total-row">
                <span>Tổng cộng</span>
                <span className="summary-total-price">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
