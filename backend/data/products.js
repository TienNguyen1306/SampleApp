import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_FILE = join(__dirname, 'products.json')

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Áo thun nam', price: 199000, emoji: '👕', tag: 'Mới', category: 'Thời trang', stock: 50 },
  { id: 2, name: 'Giày sneaker', price: 599000, emoji: '👟', tag: 'Hot', category: 'Giày dép', stock: 30 },
  { id: 3, name: 'Túi xách nữ', price: 349000, emoji: '👜', tag: 'Sale', category: 'Phụ kiện', stock: 20 },
  { id: 4, name: 'Đồng hồ thời trang', price: 899000, emoji: '⌚', tag: 'Mới', category: 'Phụ kiện', stock: 15 },
  { id: 5, name: 'Kính mát', price: 249000, emoji: '🕶️', tag: 'Hot', category: 'Phụ kiện', stock: 40 },
  { id: 6, name: 'Mũ bucket', price: 149000, emoji: '🧢', tag: 'Sale', category: 'Thời trang', stock: 60 },
  { id: 7, name: 'Váy hoa', price: 279000, emoji: '👗', tag: 'Mới', category: 'Thời trang', stock: 25 },
  { id: 8, name: 'Balo du lịch', price: 459000, emoji: '🎒', tag: 'Hot', category: 'Phụ kiện', stock: 18 },
]

function load() {
  if (!existsSync(DB_FILE)) return { products: DEFAULT_PRODUCTS, nextId: 9 }
  try {
    return JSON.parse(readFileSync(DB_FILE, 'utf-8'))
  } catch {
    return { products: DEFAULT_PRODUCTS, nextId: 9 }
  }
}

function save() {
  writeFileSync(DB_FILE, JSON.stringify({ products, nextId }, null, 2))
}

let { products, nextId } = load()

export { products }

export function createProduct(data) {
  const product = { id: nextId++, ...data }
  products.push(product)
  save()
  return product
}

export function deleteProduct(id) {
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) return null
  const [removed] = products.splice(index, 1)
  save()
  return removed
}
