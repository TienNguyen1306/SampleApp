import { User } from '../models/User.js'

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ errorCode: 'USER_NOT_FOUND' })

    res.json({
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    })
  } catch (err) {
    res.status(500).json({ errorCode: 'UNKNOWN' })
  }
}

export async function updateProfile(req, res) {
  try {
    const { name } = req.body
    const updates = {}

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ errorCode: 'MISSING_FIELDS' })
      updates.name = name.trim()
    }

    if (req.file) {
      const base64 = req.file.buffer.toString('base64')
      updates.avatar = `data:${req.file.mimetype};base64,${base64}`
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, select: '-password' }
    )

    if (!user) return res.status(404).json({ errorCode: 'USER_NOT_FOUND' })

    res.json({
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    })
  } catch (err) {
    res.status(500).json({ errorCode: 'UNKNOWN' })
  }
}
