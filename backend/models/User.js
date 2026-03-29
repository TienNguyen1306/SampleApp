import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 3 },
  password: { type: String, required: true, minlength: 6 },
  name:     { type: String, required: true },
  role:     { type: String, enum: ['admin', 'customer'], default: 'customer' },
  avatar:   { type: String, default: null }, // base64 encoded image
}, { timestamps: true })

export const User = mongoose.model('User', userSchema)
