import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { createProductRequest } from '../api/products'
import './AddProductPage.css'

const TAGS = ['Mới', 'Hot', 'Sale']
const CATEGORIES = ['Thời trang', 'Giày dép', 'Phụ kiện']
const EMOJIS = ['👕', '👗', '👟', '👜', '🎒', '⌚', '🕶️', '🧢', '💍', '🧣', '🧤', '🥿', '👒', '🧳']

export default function AddProductPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [form, setForm] = useState({
    name: '',
    price: '',
    emoji: '👕',
    tag: 'Mới',
    category: 'Thời trang',
    stock: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createProductRequest(form)
      navigate('/home')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-product-wrapper">
      <header className="add-product-header">
        <div className="add-product-header-inner">
          <button className="back-btn" onClick={() => navigate('/home')}>{t('admin.back')}</button>
          <div className="add-product-logo">
            <span>🛍️</span>
            <span>ShopVN</span>
          </div>
        </div>
      </header>

      <main className="add-product-main">
        <div className="add-product-card">
          <h1 className="add-product-title">{t('addProduct.title')}</h1>

          <form onSubmit={handleSubmit} className="add-product-form">
            <div className="form-group">
              <label>{t('addProduct.name')}</label>
              <input
                name="name"
                type="text"
                placeholder={t('addProduct.name')}
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('addProduct.price')}</label>
                <input
                  name="price"
                  type="number"
                  placeholder="199000"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>{t('addProduct.stock')}</label>
                <input
                  name="stock"
                  type="number"
                  placeholder="50"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t('addProduct.emoji')}</label>
              <div className="emoji-picker">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    className={`emoji-btn ${form.emoji === e ? 'selected' : ''}`}
                    onClick={() => setForm((prev) => ({ ...prev, emoji: e }))}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('addProduct.tag')}</label>
                <select name="tag" value={form.tag} onChange={handleChange}>
                  {TAGS.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>{t('addProduct.category')}</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {error && <div className="error-message" role="alert">⚠️ {error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '...' : t('addProduct.submit')}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
