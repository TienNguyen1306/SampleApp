import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchProfile, updateProfile } from '../api/profile'
import './ProfilePage.css'

export default function ProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [currentAvatar, setCurrentAvatar] = useState(null)
  const [previewAvatar, setPreviewAvatar] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchProfile()
      .then((data) => {
        setName(data.name)
        setUsername(data.username)
        setCurrentAvatar(data.avatar)
        setLoading(false)
      })
      .catch(() => {
        navigate('/login')
      })
  }, [navigate])

  function handleAvatarClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPreviewAvatar(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError(t('errors.MISSING_FIELDS'))
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const updated = await updateProfile(name, avatarFile)
      setCurrentAvatar(updated.avatar)
      setPreviewAvatar(null)
      setAvatarFile(null)

      // Sync sessionStorage so header updates immediately
      const stored = JSON.parse(sessionStorage.getItem('user') || '{}')
      const newUser = { ...stored, name: updated.name, avatar: updated.avatar }
      sessionStorage.setItem('user', JSON.stringify(newUser))

      setSuccess(t('profile.success'))
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(t(`errors.${err.errorCode || 'UNKNOWN'}`))
    } finally {
      setSaving(false)
    }
  }

  const displayAvatar = previewAvatar || currentAvatar

  if (loading) return <div className="pf-loading">{t('profile.loading')}</div>

  return (
    <div className="pf-page">
      <div className="pf-card">
        <div className="pf-header">
          <button className="pf-back" onClick={() => navigate('/home')}>{t('profile.back')}</button>
          <h1 className="pf-title">{t('profile.title')}</h1>
        </div>

        <form onSubmit={handleSave} className="pf-form">
          {/* Avatar */}
          <div className="pf-avatar-section">
            <div className="pf-avatar-wrapper" onClick={handleAvatarClick} title={t('profile.changeAvatar')}>
              {displayAvatar
                ? <img src={displayAvatar} alt="avatar" className="pf-avatar-img" />
                : <div className="pf-avatar-placeholder">👤</div>
              }
              <div className="pf-avatar-overlay">
                <span>📷</span>
              </div>
            </div>
            <p className="pf-avatar-hint">{t('profile.avatarHint')}</p>
            <input
              ref={fileInputRef}
              data-testid="profile-avatar-input"
              type="file"
              accept="image/*"
              className="pf-file-input"
              onChange={handleFileChange}
            />
          </div>

          {/* Username (read-only) */}
          <div className="pf-form-group">
            <label className="pf-label">{t('profile.username')}</label>
            <input className="pf-input pf-input-readonly" value={username} readOnly />
          </div>

          {/* Name */}
          <div className="pf-form-group">
            <label className="pf-label">{t('profile.name')}</label>
            <input
              data-testid="profile-name"
              className="pf-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('profile.namePlaceholder')}
            />
          </div>

          {error && <p className="pf-error" data-testid="profile-error">{error}</p>}
          {success && <p className="pf-success" data-testid="profile-success">{success}</p>}

          <button type="submit" className="pf-save-btn" data-testid="profile-save" disabled={saving}>
            {saving ? t('profile.saving') : t('profile.save')}
          </button>
        </form>
      </div>
    </div>
  )
}
