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
    return res.status(400).json({ errorCode: 'MISSING_FIELDS' })
  }
  if (username.length < 3) {
    return res.status(400).json({ errorCode: 'USERNAME_TOO_SHORT' })
  }
  if (password.length < 8) {
    return res.status(400).json({ errorCode: 'PASSWORD_TOO_SHORT' })
  }
  if (!['admin', 'customer'].includes(role)) {
    return res.status(400).json({ errorCode: 'INVALID_ROLE' })
  }

  const existing = await User.findOne({ username })
  if (existing) {
    return res.status(409).json({ errorCode: 'USERNAME_TAKEN' })
  }

  const user = await User.create({ username, password, name, role })
  const { password: _, ...userWithoutPassword } = user.toObject()
  console.info(`[AUDIT] Admin "${req.user.username}" created user "${username}" (role: ${role}) at ${new Date().toISOString()}`)
  res.status(201).json(userWithoutPassword)
}

// DELETE /api/users  (bulk)
export async function deleteUsers(req, res) {
  const { ids } = req.body

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ errorCode: 'NO_USERS_SELECTED' })
  }

  // Không cho xoá user có username = 'admin'
  const protectedUsers = await User.find({ _id: { $in: ids }, username: 'admin' })
  if (protectedUsers.length > 0) {
    return res.status(403).json({ errorCode: 'CANNOT_DELETE_ADMIN' })
  }

  const result = await User.deleteMany({ _id: { $in: ids } })
  console.info(`[AUDIT] Admin "${req.user.username}" deleted ${result.deletedCount} user(s) ids=[${ids.join(',')}] at ${new Date().toISOString()}`)
  res.json({ deletedCount: result.deletedCount })
}

// PATCH /api/users/:id/role
export async function updateUserRole(req, res) {
  const { role } = req.body
  const { id } = req.params

  if (!['admin', 'customer'].includes(role)) {
    return res.status(400).json({ errorCode: 'INVALID_ROLE' })
  }

  const user = await User.findById(id)
  if (!user) return res.status(404).json({ errorCode: 'USER_NOT_FOUND' })
  if (user.username === 'admin') {
    return res.status(403).json({ errorCode: 'CANNOT_CHANGE_ADMIN_ROLE' })
  }

  const oldRole = user.role
  user.role = role
  await user.save()

  console.info(`[AUDIT] Admin "${req.user.username}" changed role of "${user.username}" from ${oldRole} to ${role} at ${new Date().toISOString()}`)
  res.json({ id: user._id, username: user.username, name: user.name, role: user.role })
}
