const DEFAULT_JWT_SECRET = 'shopvn-dev-secret-do-not-use-in-production'

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET not set in environment. Using default dev secret — set JWT_SECRET before deploying to production!')
}

export const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET
export const JWT_EXPIRES_IN = '7d'
export const PORT = process.env.PORT || 3001

export const APP_SECRET = process.env.APP_SECRET || 'shopvn-app-secret-2024'

// Stripe — thay bằng secret key từ https://dashboard.stripe.com/test/apikeys
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_SECRET_KEY'

// MongoDB — để trống hoặc 'local' sẽ dùng in-memory (dev)
// Ví dụ local thật: 'mongodb://localhost:27017/shopvn'
export const MONGODB_URI = process.env.MONGODB_URI || 'local'
