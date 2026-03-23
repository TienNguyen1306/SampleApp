import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_FILE = join(__dirname, 'carts.json')

function load() {
  if (!existsSync(DB_FILE)) return {}
  try {
    return JSON.parse(readFileSync(DB_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

let carts = load()

export function getCart(userId) {
  return carts[String(userId)] || []
}

export function saveCart(userId, items) {
  carts[String(userId)] = items
  writeFileSync(DB_FILE, JSON.stringify(carts, null, 2))
}
