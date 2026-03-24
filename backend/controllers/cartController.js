import { Cart } from '../models/Cart.js'

export async function getCartItems(req, res) {
  const cart = await Cart.findOne({ userId: req.user.id })
  res.json(cart ? cart.items : [])
}

export async function updateCart(req, res) {
  const { items } = req.body
  if (!Array.isArray(items)) return res.status(400).json({ message: 'items must be an array' })

  await Cart.findOneAndUpdate(
    { userId: req.user.id },
    { items },
    { upsert: true, new: true }
  )

  res.json({ ok: true })
}
