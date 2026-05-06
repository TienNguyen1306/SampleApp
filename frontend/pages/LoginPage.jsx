import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { loginRequest } from '../api/auth'
import LanguageSwitcher from '../components/LanguageSwitcher'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { token, user } = await loginRequest(username, password)
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('user', JSON.stringify(user))
      navigate('/home')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-bg">
      <div className="login-card" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <LanguageSwitcher />
        </div>

        <Link to="/home" className="login-logo">
          <span className="logo-icon">🛍️</span>
          <h1 className="logo-name">ShopVN</h1>
        </Link>

        <h2 className="login-title">{t('login.title')}</h2>
        <p className="login-subtitle">{t('login.title')} — ShopVN</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">{t('login.username')}</label>
            <input
              id="username"
              data-testid="login-username"
              type="text"
              placeholder={t('login.username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('login.password')}</label>
            <input
              id="password"
              data-testid="login-password"
              type="password"
              placeholder={t('login.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message" role="alert">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="login-btn" data-testid="login-submit" disabled={loading}>
            {loading ? '...' : t('login.submit')}
          </button>
        </form>

        <p className="login-hint">
          Demo: <strong>admin</strong> / <strong>password123</strong>
        </p>
        <p className="login-hint">
          {t('login.noAccount')}{' '}
          <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register') }}>
            {t('login.register')}
          </a>
        </p>
      </div>
    </div>
  )
}
