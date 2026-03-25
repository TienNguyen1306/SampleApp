import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language?.startsWith('en') ? 'en' : 'vi'
  const next = LANGUAGES.find((l) => l.code !== current)
  const curr = LANGUAGES.find((l) => l.code === current)

  const toggle = () => {
    i18n.changeLanguage(next.code)
  }

  return (
    <button
      onClick={toggle}
      title={`Switch to ${next.label}`}
      aria-label={`Switch to ${next.label}`}
      style={{
        fontSize: '1.4rem',
        background: 'none',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '6px',
        cursor: 'pointer',
        padding: '2px 6px',
        lineHeight: 1,
      }}
    >
      {curr.flag}
    </button>
  )
}
