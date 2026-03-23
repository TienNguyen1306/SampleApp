import { Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import RegisterPage from './pages/RegisterPage'
import AddProductPage from './pages/AddProductPage'
import AdminProductsPage from './pages/AdminProductsPage'

function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/admin/add-product" element={<AddProductPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </CartProvider>
  )
}

export default App
