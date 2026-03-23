import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getCartItems, updateCart } from '../controllers/cartController.js'

const router = Router()

router.get('/', requireAuth, getCartItems)
router.put('/', requireAuth, updateCart)

export default router
