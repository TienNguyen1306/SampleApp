import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCart } from '../context/CartContext'
import { createPaymentIntent, placeOrder } from '../api/orders'
import LanguageSwitcher from '../components/LanguageSwitcher'
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
  const { t } = useTranslation()
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
            setError(t('checkout.stripeNotReady'))
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
        <h2>{t('checkout.recipientInfo')}</h2>
        <div className="form-group">
          <label>{t('checkout.fullName')}</label>
          <input
            name="recipientName"
            data-testid="checkout-name"
            placeholder={t('checkout.fullNamePlaceholder')}
            value={form.recipientName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>{t('checkout.phone')}</label>
          <input
            name="recipientPhone"
            data-testid="checkout-phone"
            placeholder={t('checkout.phonePlaceholder')}
            value={form.recipientPhone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>{t('checkout.address')}</label>
          <input
            name="address"
            data-testid="checkout-address"
            placeholder={t('checkout.addressPlaceholder')}
            value={form.address}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="checkout-section">
        <h2>{t('checkout.paymentMethod')}</h2>
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
            <span>{t('checkout.cod')}</span>
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
            <span>{t('checkout.stripe')}</span>
          </label>
        </div>

        {paymentMethod === 'card' && (
          <div className="card-element-wrapper">
            <label>{t('checkout.cardInfo')}</label>
            <div className="card-element-container">
              {isMockMode ? (
                <input
                  type="text"
                  defaultValue="4242 4242 4242 4242"
                  placeholder="4242 4242 4242 4242"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              ) : (
                <CardElement options={CARD_ELEMENT_OPTIONS} />
              )}
            </div>
            <p className="card-hint">
              {isMockMode
                ? <>🧪 Mock mode: <code>4242 4242 4242 4242</code></>
                : <>Test: <code>4242 4242 4242 4242</code> · MM/YY · CVC</>
              }
            </p>
          </div>
        )}
      </div>

      {error && <div className="checkout-error">⚠️ {error}</div>}

      <button type="submit" className="btn-checkout" data-testid="checkout-submit" disabled={loading}>
        {loading
          ? t('checkout.processing')
          : paymentMethod === 'card'
          ? `${t('checkout.submitCard')} ${formatPrice(totalPrice)}`
          : `${t('checkout.submit')} ${formatPrice(totalPrice)}`}
      </button>
    </form>
  )
}

function OrderSuccess({ order, onContinue }) {
  const { t } = useTranslation()
  return (
    <div className="checkout-success">
      <div className="success-icon">✅</div>
      <h2 data-testid="checkout-success-heading">{t('checkout.success')}</h2>
      <p>
        {t('checkout.orderId')}: <strong>#{order._id || order.id}</strong>
      </p>
      <p>
        {t('checkout.recipient')}: <strong>{order.recipientName}</strong>
      </p>
      <p>{order.address}</p>
      <p>
        <strong>{order.paymentMethod === 'card' ? t('checkout.paymentCard') : t('checkout.paymentCash')}</strong>
      </p>
      <p className="success-total">{formatPrice(order.totalPrice)}</p>
      <button className="btn-primary" data-testid="checkout-continue" onClick={onContinue}>
        {t('checkout.continueShopping')}
      </button>
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
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
            <Link to="/home" className="checkout-logo">
              <span>🛍️</span>
              <span>ShopVN</span>
            </Link>
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
          <button className="back-btn" data-testid="checkout-back" onClick={() => navigate('/cart')}>
            {t('checkout.back')}
          </button>
          <Link to="/home" className="checkout-logo">
            <span>🛍️</span>
            <span>ShopVN</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="checkout-main">
        <div className="checkout-grid">
          <div className="checkout-left">
            <h1 className="checkout-title">{t('checkout.title')}</h1>
            <Elements stripe={stripePromise}>
              <CheckoutForm onSuccess={setSuccessOrder} />
            </Elements>
          </div>

          <div className="checkout-right">
            <div className="order-summary">
              <h2>{t('checkout.yourOrder')}</h2>
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
                <span>{t('cart.shipping')}</span>
                <span className="free">{t('cart.free')}</span>
              </div>
              <div className="summary-total-row">
                <span>{t('cart.total')}</span>
                <span className="summary-total-price">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
