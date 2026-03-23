import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config.js'

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Vui lòng đăng nhập.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' })
  }
}
