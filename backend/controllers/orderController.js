import Stripe from 'stripe'
import { STRIPE_SECRET_KEY } from '../config.js'
import { Order } from '../models/Order.js'

const isMockMode = STRIPE_SECRET_KEY.startsWith('sk_test_YOUR')
const stripe = isMockMode ? null : new Stripe(STRIPE_SECRET_KEY)

// POST /api/orders/payment-intent
export async function createPaymentIntent(req, res) {
  const { amount } = req.body

  if (isMockMode) {
    return res.json({ clientSecret: `mock_pi_${Date.now()}_secret_mock` })
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'vnd',
    })
    res.json({ clientSecret: intent.client_secret })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/orders
export async function placeOrder(req, res) {
  const { items, recipientName, recipientPhone, address, paymentMethod, paymentIntentId, totalPrice } = req.body

  const order = await Order.create({
    userId: req.user.id,
    items,
    recipientName,
    recipientPhone,
    address,
    paymentMethod,
    paymentIntentId: paymentIntentId || null,
    totalPrice,
    status: 'confirmed',
  })

  res.status(201).json(order)
}

// GET /api/orders?page=1&limit=10&search=&status=&paymentMethod=
export async function getOrders(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10))
  const search = (req.query.search || '').trim()
  const status = req.query.status || ''
  const paymentMethod = req.query.paymentMethod || ''

  const query = { userId: req.user.id }

  if (status) query.status = status
  if (paymentMethod) query.paymentMethod = paymentMethod
  if (search) {
    query.$or = [
      { recipientName: { $regex: search, $options: 'i' } },
      { address: { $regex: search, $options: 'i' } },
      { 'items.name': { $regex: search, $options: 'i' } },
    ]
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(query),
  ])

  res.json({
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

// DELETE /api/orders/:id
export async function deleteOrder(req, res) {
  const order = await Order.findOne({ _id: req.params.id, userId: req.user.id })
  if (!order) return res.status(404).json({ message: 'ORDER_NOT_FOUND' })
  await order.deleteOne()
  res.json({ message: 'OK' })
}
