import { Router } from 'express'
import { getUsers, createUser, deleteUsers, updateUserRole } from '../controllers/userController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { checkAppKey } from '../middleware/checkAppKey.js'

const router = Router()

// checkAppKey: chỉ cho phép request từ app nội bộ (có X-App-Key header đúng)
router.use(checkAppKey, requireAuth, requireAdmin)

router.get('/', getUsers)
router.post('/', createUser)
router.delete('/', deleteUsers)
router.patch('/:id/role', updateUserRole)

export default router
