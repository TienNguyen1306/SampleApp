import { products, createProduct, deleteProduct } from '../data/products.js'

export function getProducts(req, res) {
  const { category, tag } = req.query

  let result = products

  if (category) {
    result = result.filter((p) => p.category === category)
  }

  if (tag) {
    result = result.filter((p) => p.tag === tag)
  }

  res.json(result)
}

export function getProductById(req, res) {
  const product = products.find((p) => p.id === Number(req.params.id))

  if (!product) {
    return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' })
  }

  res.json(product)
}

export function addProduct(req, res) {
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

  const product = createProduct({
    name,
    price: Number(price),
    emoji,
    tag,
    category,
    stock: Number(stock),
  })

  res.status(201).json(product)
}

export function removeProduct(req, res) {
  const product = deleteProduct(Number(req.params.id))
  if (!product) {
    return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' })
  }
  res.json({ message: 'Đã xóa sản phẩm.', product })
}
