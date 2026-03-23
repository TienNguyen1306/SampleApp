import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_FILE = join(__dirname, 'users.json')

const DEFAULT_USERS = [
  { id: 1, username: 'admin', password: 'password123', name: 'Admin User', role: 'admin' },
  { id: 2, username: 'user', password: '123456', name: 'Nguyễn Văn A', role: 'customer' },
]

function load() {
  if (!existsSync(DB_FILE)) return { users: DEFAULT_USERS, nextId: 3 }
  try {
    return JSON.parse(readFileSync(DB_FILE, 'utf-8'))
  } catch {
    return { users: DEFAULT_USERS, nextId: 3 }
  }
}

function save() {
  writeFileSync(DB_FILE, JSON.stringify({ users, nextId }, null, 2))
}

let { users, nextId } = load()

export { users }

export function findByUsername(username) {
  return users.find((u) => u.username === username)
}

export function createUser(data) {
  const user = { id: nextId++, ...data, role: 'customer' }
  users.push(user)
  save()
  return user
}
