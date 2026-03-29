import { Router } from 'express'
import { getProfile, updateProfile } from '../controllers/profileController.js'
import { requireAuth } from '../middleware/auth.js'
import { upload, handleUploadError } from '../middleware/upload.js'

const router = Router()

router.get('/', requireAuth, getProfile)
router.patch('/', requireAuth, upload.single('avatar'), handleUploadError, updateProfile)

export default router
