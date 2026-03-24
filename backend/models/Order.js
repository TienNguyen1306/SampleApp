import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.Mixed, required: true },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true, min: 1 },
  emoji:     { type: String },
}, { _id: false })

const orderSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.Mixed, required: true },
  items:           { type: [orderItemSchema], required: true },
  recipientName:   { type: String, required: true },
  recipientPhone:  { type: String },
  address:         { type: String, required: true },
  paymentMethod:   { type: String, enum: ['cash', 'card'], required: true },
  paymentIntentId: { type: String, default: null },
  totalPrice:      { type: Number, required: true },
  status:          { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered'], default: 'confirmed' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

export const Order = mongoose.model('Order', orderSchema)
