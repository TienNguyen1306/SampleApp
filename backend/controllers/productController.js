import { Product } from '../models/Product.js'

export async function getProducts(req, res) {
  const { category, tag } = req.query
  const filter = {}
  if (category) filter.category = category
  if (tag) filter.tag = tag

  const products = await Product.find(filter)
  res.json(products)
}

export async function getProductById(req, res) {
  const product = await Product.findById(req.params.id)
  if (!product) {
    return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' })
  }
  res.json(product)
}

export async function addProduct(req, res) {
  const { name, price, emoji, tag, category, stock } = req.body

  if (!name || !price || !emoji || !tag || !category || stock === undefined) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin sản phẩm.' })
  }
  if (isNaN(price) || Number(price) <= 0) {
    return res.status(400).json({ message: 'Giá sản phẩm không hợp lệ.' })
  }
  if (isNaN(stock) || Number(stock) < 0) {
    return res.status(400).json({ message: 'Số lượng tồn kho không hợp lệ.' })
  }

  const product = await Product.create({
    name,
    price: Number(price),
    emoji,
    tag,
    category,
    stock: Number(stock),
  })

  res.status(201).json(product)
}

export async function removeProduct(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) {
    return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' })
  }
  res.json({ message: 'Đã xóa sản phẩm.', product })
}
