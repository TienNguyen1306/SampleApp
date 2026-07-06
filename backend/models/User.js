import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 3, index: true },
  password: { type: String, required: true },
  name:     { type: String, required: true },
  role:     { type: String, enum: ['admin', 'customer'], default: 'customer', index: true },
  avatar:   { type: String, default: null },
}, { timestamps: true })

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

export const User = mongoose.model('User', userSchema)

// Ensure indexes on fields used for sort/filter (required by Cosmos DB for MongoDB)
User.createIndexes().catch(() => {})
