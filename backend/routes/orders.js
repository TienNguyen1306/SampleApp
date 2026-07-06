import { Router } from 'express'
import { createPaymentIntent, placeOrder, getOrders, deleteOrder, deleteAllOrders } from '../controllers/orderController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

/**
 * @swagger
 * /orders/payment-intent:
 *   post:
 *     tags: [Orders]
 *     summary: Create a payment intent (mock or real Stripe)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number, example: 90000 }
 *     responses:
 *       200:
 *         description: Client secret for payment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties: { clientSecret: { type: string } }
 *       401:
 *         description: Missing / invalid token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/payment-intent', requireAuth, createPaymentIntent)

/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Place an order
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, recipientName, recipientPhone, address, paymentMethod, totalPrice]
 *             properties:
 *               items: { type: array, items: { $ref: '#/components/schemas/OrderItem' } }
 *               recipientName: { type: string }
 *               recipientPhone: { type: string }
 *               address: { type: string }
 *               paymentMethod: { type: string, enum: [cash, card] }
 *               paymentIntentId: { type: string, nullable: true }
 *               totalPrice: { type: number }
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       400:
 *         description: Missing fields
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', requireAuth, placeOrder)

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: Order list (current user, paginated)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: number, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: number, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Match recipientName, address, or items[].name
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, confirmed, shipped, delivered] }
 *       - in: query
 *         name: paymentMethod
 *         schema: { type: string, enum: [cash, card] }
 *     responses:
 *       200:
 *         description: Paginated order list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders: { type: array, items: { $ref: '#/components/schemas/Order' } }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get('/', requireAuth, getOrders)

/**
 * @swagger
 * /orders:
 *   delete:
 *     tags: [Orders]
 *     summary: Delete all orders matching the current filter
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, confirmed, shipped, delivered] }
 *       - in: query
 *         name: paymentMethod
 *         schema: { type: string, enum: [cash, card] }
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: OK }
 *                 deleted: { type: number, example: 3 }
 */
router.delete('/', requireAuth, deleteAllOrders)

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     tags: [Orders]
 *     summary: Delete one order (current user)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties: { message: { type: string, example: OK } }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:id', requireAuth, deleteOrder)

export default router
