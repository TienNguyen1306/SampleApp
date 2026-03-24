export const JWT_SECRET = 'shopvn-secret-key-change-in-production'
export const JWT_EXPIRES_IN = '7d'
export const PORT = 3001

// Stripe — thay bằng secret key từ https://dashboard.stripe.com/test/apikeys
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_SECRET_KEY'

// MongoDB — để trống hoặc 'local' sẽ dùng in-memory (dev)
// Ví dụ local thật: 'mongodb://localhost:27017/shopvn'
export const MONGODB_URI = process.env.MONGODB_URI || 'local'
