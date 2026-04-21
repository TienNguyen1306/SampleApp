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

async function fetchCartFromServer() {
  const token = getToken()
  if (!token) return null
  try {
    const res = await fetch(CART_API, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return null
    return await res.json()
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
      body: JSON.stringify({ items }),
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

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, updateQuantity, clearCart, totalCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
