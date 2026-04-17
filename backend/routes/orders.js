import { Router } from 'express'
import { createPaymentIntent, placeOrder, getOrders, deleteOrder } from '../controllers/orderController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/payment-intent', requireAuth, createPaymentIntent)
router.post('/', requireAuth, placeOrder)
router.get('/', requireAuth, getOrders)
router.delete('/:id', requireAuth, deleteOrder)

export default router
