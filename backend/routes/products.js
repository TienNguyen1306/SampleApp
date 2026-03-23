import { Router } from 'express'
import { getProducts, getProductById, addProduct, removeProduct } from '../controllers/productController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const router = Router()

router.get('/', requireAuth, getProducts)
router.get('/:id', requireAuth, getProductById)
router.post('/', requireAuth, requireAdmin, addProduct)
router.delete('/:id', requireAuth, requireAdmin, removeProduct)

export default router
