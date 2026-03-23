import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginRequest } from '../api/auth'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
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
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-icon">🛍️</span>
          <h1 className="logo-name">ShopVN</h1>
        </div>

        <h2 className="login-title">Đăng nhập</h2>
        <p className="login-subtitle">Chào mừng bạn quay lại!</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Tài khoản</label>
            <input
              id="username"
              type="text"
              placeholder="Nhập tài khoản"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu"
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

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="login-hint">
          Demo: <strong>admin</strong> / <strong>password123</strong> hoặc <strong>user</strong> / <strong>123456</strong>
        </p>
        <p className="login-hint">
          Chưa có tài khoản?{' '}
          <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register') }}>
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  )
}
