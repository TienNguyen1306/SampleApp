import { Router } from 'express'
import { getUsers, createUser, deleteUsers, updateUserRole } from '../controllers/userController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { checkAppKey } from '../middleware/checkAppKey.js'

const router = Router()

// checkAppKey: chỉ cho phép request từ app nội bộ (có X-App-Key header đúng)
router.use(checkAppKey, requireAuth, requireAdmin)

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: User list (paginated, admin only)
 *     security: [{ bearerAuth: [], appKeyAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [admin, customer] }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: createdAt }
 *       - in: query
 *         name: sortDir
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *       - in: query
 *         name: page
 *         schema: { type: number, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: number, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated user list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users: { type: array, items: { $ref: '#/components/schemas/User' } }
 *                 total: { type: number }
 *                 page: { type: number }
 *                 totalPages: { type: number }
 *       403:
 *         description: Missing/invalid X-App-Key or insufficient permissions
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/', getUsers)

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user (admin only)
 *     security: [{ bearerAuth: [], appKeyAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, name]
 *             properties:
 *               username: { type: string }
 *               password: { type: string, format: password }
 *               name: { type: string }
 *               role: { type: string, enum: [admin, customer] }
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Missing fields
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Username already exists
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', createUser)

/**
 * @swagger
 * /users:
 *   delete:
 *     tags: [Users]
 *     summary: Bulk delete users by id (admin only, cannot delete the 'admin' user)
 *     security: [{ bearerAuth: [], appKeyAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: OK }
 *                 deleted: { type: number }
 */
router.delete('/', deleteUsers)

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Change user role (admin only, cannot change the 'admin' user's role)
 *     security: [{ bearerAuth: [], appKeyAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [admin, customer] }
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Invalid role (INVALID_ROLE)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.patch('/:id/role', updateUserRole)

export default router
