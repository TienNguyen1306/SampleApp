import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getCartItems, updateCart } from '../controllers/cartController.js'

const router = Router()

/**
 * @swagger
 * /cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get current cart
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of items in the cart
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/CartItem' }
 */
router.get('/', requireAuth, getCartItems)

/**
 * @swagger
 * /cart:
 *   put:
 *     tags: [Cart]
 *     summary: Update (overwrite) the entire cart
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items: { type: array, items: { $ref: '#/components/schemas/CartItem' } }
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties: { ok: { type: boolean, example: true } }
 */
router.put('/', requireAuth, updateCart)

export default router
