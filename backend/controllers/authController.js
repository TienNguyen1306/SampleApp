import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config.js'

export async function login(req, res) {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.' })
  }

  const user = await User.findOne({ username, password })

  if (!user) {
    return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không đúng.' })
  }

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )

  res.json({
    token,
    user: { id: user._id, username: user.username, name: user.name, role: user.role },
  })
}

export async function getMe(req, res) {
  const user = await User.findById(req.user.id)
  if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' })

  res.json({ id: user._id, username: user.username, name: user.name, role: user.role })
}

export async function register(req, res) {
  const { username, password, name } = req.body

  if (!username || !password || !name) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin.' })
  }
  if (username.length < 3) {
    return res.status(400).json({ message: 'Tên đăng nhập phải có ít nhất 3 ký tự.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' })
  }

  const existing = await User.findOne({ username })
  if (existing) {
    return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại.' })
  }

  const user = await User.create({ username, password, name, role: 'customer' })
  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )

  res.status(201).json({
    token,
    user: { id: user._id, username: user.username, name: user.name, role: user.role },
  })
}
