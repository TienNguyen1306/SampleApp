import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import cartRoutes from './routes/cart.js'
import userRoutes from './routes/users.js'
import profileRoutes from './routes/profile.js'

const app = express()

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

export default app
