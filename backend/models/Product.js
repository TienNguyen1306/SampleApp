import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  price:    { type: Number, required: true, min: 0 },
  emoji:    { type: String, required: true },
  tag:      { type: String, required: true },
  category: { type: String, required: true },
  stock:    { type: Number, required: true, min: 0, default: 0 },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

export const Product = mongoose.model('Product', productSchema)
