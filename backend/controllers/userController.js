import { User } from '../models/User.js'

// GET /api/users?search=&role=&sortBy=&sortDir=&page=&limit=
export async function getUsers(req, res) {
  const { search = '', role = '', sortBy = 'createdAt', sortDir = 'desc', page = 1, limit = 10 } = req.query

  const filter = {}
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
    ]
  }
  if (role) filter.role = role

  const sortOrder = sortDir === 'asc' ? 1 : -1
  const allowedSortFields = ['username', 'name', 'role', 'createdAt']
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'

  const skip = (Number(page) - 1) * Number(limit)
  const total = await User.countDocuments(filter)
  const users = await User.find(filter, '-password')
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(Number(limit))

  res.json({
    users,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  })
}

// POST /api/users
export async function createUser(req, res) {
  const { username, password, name, role = 'customer' } = req.body

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

  const user = await User.create({ username, password, name, role })
  const { password: _, ...userWithoutPassword } = user.toObject()
  res.status(201).json(userWithoutPassword)
}

// DELETE /api/users  (bulk)
export async function deleteUsers(req, res) {
  const { ids } = req.body

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Vui lòng chọn ít nhất một user để xoá.' })
  }

  // Không cho xoá user có username = 'admin'
  const protectedUsers = await User.find({ _id: { $in: ids }, username: 'admin' })
  if (protectedUsers.length > 0) {
    return res.status(403).json({ message: 'Không thể xoá tài khoản admin.' })
  }

  const result = await User.deleteMany({ _id: { $in: ids } })
  res.json({ message: `Đã xoá ${result.deletedCount} user.`, deletedCount: result.deletedCount })
}

// PATCH /api/users/:id/role
export async function updateUserRole(req, res) {
  const { role } = req.body
  const { id } = req.params

  if (!['admin', 'customer'].includes(role)) {
    return res.status(400).json({ message: 'Quyền không hợp lệ.' })
  }

  const user = await User.findById(id)
  if (!user) return res.status(404).json({ message: 'Không tìm thấy user.' })
  if (user.username === 'admin') {
    return res.status(403).json({ message: 'Không thể thay đổi quyền tài khoản admin.' })
  }

  user.role = role
  await user.save()

  res.json({ id: user._id, username: user.username, name: user.name, role: user.role })
}
