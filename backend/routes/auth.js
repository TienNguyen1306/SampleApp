import { Router } from 'express'
import { login, getMe, register } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import { upload, handleUploadError } from '../middleware/upload.js'
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter.js'

const router = Router()

router.post('/login', loginLimiter, login)
router.post('/register', registerLimiter, upload.single('avatar'), handleUploadError, register)
router.get('/me', requireAuth, getMe)

export default router
