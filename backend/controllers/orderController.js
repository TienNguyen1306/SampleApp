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

// GET /api/orders
export async function getOrders(req, res) {
  const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 })
  res.json(orders)
}
