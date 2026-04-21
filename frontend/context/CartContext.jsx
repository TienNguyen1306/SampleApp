import { createContext, useContext, useState, useEffect } from 'react'

const CART_KEY = 'shopvn_cart'
const CART_API = '/api/cart'

const CartContext = createContext(null)

function loadLocalCart() {
  try {
    const saved = localStorage.getItem(CART_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function getToken() {
  return sessionStorage.getItem('token')
}

// Convert flat DB format → frontend {product, quantity} format
function normalizeServerItems(rawItems) {
  if (!Array.isArray(rawItems)) return []
  return rawItems
    .map((item) => {
      // Already in frontend format (e.g. from localStorage)
      if (item.product) return item
      // Flat DB format: { productId, name, price, emoji, quantity }
      if (item.productId == null) return null
      return {
        product: {
          id: item.productId,
          _id: item.productId,
          name: item.name || '',
          price: item.price ?? 0,
          emoji: item.emoji || '',
        },
        quantity: item.quantity || 1,
      }
    })
    .filter(Boolean)
}

// Convert frontend {product, quantity} → flat DB format the backend schema expects
function flattenItemsForServer(items) {
  return items.map((i) => ({
    productId: i.product?.id || i.product?._id,
    name: i.product?.name || '',
    price: i.product?.price ?? 0,
    emoji: i.product?.emoji || '',
    quantity: i.quantity,
  }))
}

async function fetchCartFromServer() {
  const token = getToken()
  if (!token) return null
  try {
    const res = await fetch(CART_API, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return null
    const raw = await res.json()
    return normalizeServerItems(raw)
  } catch {
    return null
  }
}

async function saveCartToServer(items) {
  const token = getToken()
  if (!token) return
  try {
    await fetch(CART_API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items: flattenItemsForServer(items) }),
    })
  } catch {
    // ignore
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadLocalCart)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetchCartFromServer().then((serverItems) => {
      if (serverItems !== null) setItems(serverItems)
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(CART_KEY, JSON.stringify(items))
    saveCartToServer(items)
  }, [items, loaded])

  const addToCart = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId, delta) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    )
  }

  const clearCart = () => setItems([])

  const totalCount = items.reduce((sum, i) => sum + (i.quantity || 0), 0)
  const totalPrice = items.reduce((sum, i) => sum + (i.product?.price ?? 0) * (i.quantity || 0), 0)

  return (
    <CartContext.Provider value={{ items, addToCart, updateQuantity, clearCart, totalCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
