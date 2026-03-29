import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import cartRoutes from './routes/cart.js'
import userRoutes from './routes/users.js'
import profileRoutes from './routes/profile.js'

const app = express()

// HTTP security headers
app.use(helmet())

app.use(cors({
  origin: /^http:\/\/localhost:\d+$/,
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

// Global error handler — không leak stack trace ra ngoài
app.use((err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message)
  res.status(err.status || 500).json({ errorCode: err.errorCode || 'INTERNAL_ERROR' })
})

export default app
