import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import cartRoutes from './routes/cart.js'
import userRoutes from './routes/users.js'
import profileRoutes from './routes/profile.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

// HTTP security headers
app.use(helmet())

app.use(cors({
  origin: /^http:\/\/(localhost|127\.0\.0\.1|(10|192\.168|172\.(1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}):\d+$/,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-App-Key'],
}))
app.use(express.json())

// Ngăn NoSQL injection — strip keys có $ hoặc . khỏi req.body và req.params
function sanitize(obj) {
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key]
      } else {
        sanitize(obj[key])
      }
    }
  }
}
app.use((req, _res, next) => {
  sanitize(req.body)
  sanitize(req.params)
  next()
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/users', userRoutes)
app.use('/api/profile', profileRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

// Serve built frontend static files (production)
app.use(express.static(join(__dirname, '..', 'dist')))

// SPA fallback — serve index.html for non-API routes
app.get('/{*path}', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next()
  res.sendFile(join(__dirname, '..', 'dist', 'index.html'))
})

// Global error handler — không leak stack trace ra ngoài
app.use((err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message)
  res.status(err.status || 500).json({ errorCode: err.errorCode || 'INTERNAL_ERROR' })
})

export default app
