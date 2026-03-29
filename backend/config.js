// Đọc toàn bộ secrets từ environment variables
// Copy .env.example → .env và điền giá trị trước khi chạy

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET not set. Copy .env.example → .env and fill in values.')
}
if (!process.env.APP_SECRET) {
  console.warn('⚠️  WARNING: APP_SECRET not set. Copy .env.example → .env and fill in values.')
}

export const JWT_SECRET    = process.env.JWT_SECRET    || 'shopvn-dev-jwt-secret'
export const APP_SECRET    = process.env.APP_SECRET    || 'shopvn-dev-app-secret'
export const JWT_EXPIRES_IN = '7d'
export const PORT          = process.env.PORT          || 3001
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_SECRET_KEY'
export const MONGODB_URI   = process.env.MONGODB_URI   || 'local'
