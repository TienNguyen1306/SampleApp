import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.Mixed, required: true },
  name:      { type: String },
  price:     { type: Number },
  quantity:  { type: Number, required: true, min: 1 },
  emoji:     { type: String },
}, { _id: false })

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.Mixed, required: true, unique: true },
  items:  { type: [cartItemSchema], default: [] },
}, { timestamps: true })

export const Cart = mongoose.model('Cart', cartSchema)
