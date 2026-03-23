import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_FILE = join(__dirname, 'orders.json')

function load() {
  if (!existsSync(DB_FILE)) return { orders: [], nextId: 1 }
  try {
    return JSON.parse(readFileSync(DB_FILE, 'utf-8'))
  } catch {
    return { orders: [], nextId: 1 }
  }
}

function save(orders, nextId) {
  writeFileSync(DB_FILE, JSON.stringify({ orders, nextId }, null, 2))
}

let { orders, nextId } = load()

export function getOrdersByUserId(userId) {
  return orders.filter((o) => o.userId === userId)
}

export function createOrder(data) {
  const order = { id: nextId++, ...data, createdAt: new Date().toISOString() }
  orders.push(order)
  save(orders, nextId)
  return order
}
