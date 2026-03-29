import rateLimit from 'express-rate-limit'

const isTest = process.env.NODE_ENV === 'test'

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,              // 15 phút
  max: isTest ? 1000 : 10,               // test: không giới hạn thực tế; prod: 10 lần sai / 15 phút / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.' },
  skipSuccessfulRequests: true,          // chỉ đếm request thất bại
})

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,             // 1 giờ
  max: isTest ? 1000 : 10,              // test: không giới hạn thực tế; prod: 10 lần đăng ký / giờ / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Quá nhiều lần đăng ký. Vui lòng thử lại sau.' },
})
