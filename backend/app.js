import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import cartRoutes from './routes/cart.js'
import userRoutes from './routes/users.js'

const app = express()

app.use(cors({ origin: /^http:\/\/localhost:\d+$/ }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/users', userRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

export default app
