import { getCart, saveCart } from '../data/carts.js'

export function getCartItems(req, res) {
  res.json(getCart(req.user.id))
}

export function updateCart(req, res) {
  const { items } = req.body
  if (!Array.isArray(items)) return res.status(400).json({ message: 'items must be an array' })
  saveCart(req.user.id, items)
  res.json({ ok: true })
}
