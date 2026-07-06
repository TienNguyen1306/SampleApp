import { Router } from 'express'
import { getProfile, updateProfile } from '../controllers/profileController.js'
import { requireAuth } from '../middleware/auth.js'
import { upload, handleUploadError } from '../middleware/upload.js'

const router = Router()

/**
 * @swagger
 * /profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get current profile info
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 */
router.get('/', requireAuth, getProfile)

/**
 * @swagger
 * /profile:
 *   patch:
 *     tags: [Profile]
 *     summary: Update profile (name and/or avatar)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, description: 'Leave blank to keep unchanged' }
 *               avatar: { type: string, format: binary, description: 'Image, max 5MB' }
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: name contains only whitespace (MISSING_FIELDS)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       413:
 *         description: Image file too large (FILE_TOO_LARGE)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.patch('/', requireAuth, upload.single('avatar'), handleUploadError, updateProfile)

export default router
