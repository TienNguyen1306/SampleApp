import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { registerRequest } from '../api/auth'
import './LoginPage.css'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t('register.passwordMismatch'))
      return
    }

    setLoading(true)
    try {
      const { token, user } = await registerRequest(username, password, name, avatarFile)
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
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-icon">🛍️</span>
          <h1 className="logo-name">ShopVN</h1>
        </div>

        <h2 className="login-title">{t('register.title')}</h2>
        <p className="login-subtitle">{t('register.subtitle')}</p>

        <form onSubmit={handleSubmit} className="login-form">

          {/* Avatar upload */}
          <div className="form-group" style={{ alignItems: 'center' }}>
            <div
              className="reg-avatar-wrapper"
              onClick={() => fileInputRef.current?.click()}
              title={t('profile.changeAvatar')}
            >
              {avatarPreview
                ? <img src={avatarPreview} alt="preview" className="reg-avatar-img" />
                : <div className="reg-avatar-placeholder">👤</div>
              }
              <div className="reg-avatar-overlay">📷</div>
            </div>
            <span className="reg-avatar-hint">{t('register.avatarHint')}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">{t('register.name')}</label>
            <input
              id="name"
              type="text"
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">{t('register.username')}</label>
            <input
              id="username"
              type="text"
              placeholder={t('register.usernamePlaceholder')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('register.password')}</label>
            <input
              id="password"
              type="password"
              placeholder={t('register.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('register.confirmPassword')}</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder={t('register.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="error-message" role="alert">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? t('register.submitting') : t('register.submit')}
          </button>
        </form>

        <p className="login-hint">
          {t('register.haveAccount')}{' '}
          <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login') }}>
            {t('register.login')}
          </a>
        </p>
      </div>
    </div>
  )
}
