import { APP_SECRET } from '../config.js'

/**
 * Middleware kiểm tra X-App-Key header.
 * Chỉ cho phép request đến từ app nội bộ (frontend của mình).
 * Các tool bên ngoài như Postman sẽ bị từ chối nếu không có key.
 */
export function checkAppKey(req, res, next) {
  const appKey = req.headers['x-app-key']

  if (!appKey || appKey !== APP_SECRET) {
    return res.status(403).json({ errorCode: 'FORBIDDEN' })
  }

  next()
}
