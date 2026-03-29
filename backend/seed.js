import { User } from './models/User.js'
import { Product } from './models/Product.js'

export async function seedDatabase() {
  // Seed users nếu chưa có
  // Dùng .save() thay vì insertMany để trigger bcrypt pre-save hook
  const userCount = await User.countDocuments()
  if (userCount === 0) {
    const seedUsers = [
      { username: 'admin',    password: 'password123', name: 'Admin User',   role: 'admin' },
      { username: 'user',     password: '123456',      name: 'Nguyễn Văn A', role: 'customer' },
      { username: 'testuser', password: '123456',      name: 'Test User',    role: 'customer' },
    ]
    for (const data of seedUsers) {
      await new User(data).save()
    }
    console.log('✅ Seeded users')
  }

  // Seed products nếu chưa có
  const productCount = await Product.countDocuments()
  if (productCount === 0) {
    await Product.insertMany([
      { name: 'Áo thun nam',         price: 199000, emoji: '👕', tag: 'Mới',  category: 'Thời trang', stock: 50 },
      { name: 'Giày sneaker',         price: 599000, emoji: '👟', tag: 'Hot',  category: 'Giày dép',   stock: 30 },
      { name: 'Túi xách nữ',          price: 349000, emoji: '👜', tag: 'Sale', category: 'Phụ kiện',   stock: 20 },
      { name: 'Đồng hồ thời trang',   price: 899000, emoji: '⌚', tag: 'Mới',  category: 'Phụ kiện',   stock: 15 },
      { name: 'Kính mát',             price: 249000, emoji: '🕶️', tag: 'Hot',  category: 'Phụ kiện',   stock: 40 },
      { name: 'Quần jeans',           price: 459000, emoji: '👖', tag: 'Sale', category: 'Thời trang', stock: 25 },
    ])
    console.log('✅ Seeded products')
  }
}
