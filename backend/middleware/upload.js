import multer from 'multer'

const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(Object.assign(new Error('INVALID_FILE_TYPE'), { code: 'INVALID_FILE_TYPE' }))
    }
    cb(null, true)
  },
})

// Express error handler for multer errors — must be used after upload middleware
export function handleUploadError(err, req, res, next) {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ errorCode: 'FILE_TOO_LARGE' })
  }
  if (err?.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ errorCode: 'INVALID_FILE_TYPE' })
  }
  next(err)
}
