import { User } from './models/User.js'
import { Product } from './models/Product.js'

export async function seedDatabase() {
  // Seed users nếu chưa có
  const userCount = await User.countDocuments()
  if (userCount === 0) {
    await User.insertMany([
      { username: 'admin',      password: 'password123', name: 'Admin User',       role: 'admin' },
      { username: 'user',       password: '123456',      name: 'Nguyễn Văn A',     role: 'customer' },
      { username: 'testuser',   password: '123456',      name: 'Test User',         role: 'customer' },
      { username: 'anhtien123', password: 'Abcd1234@',   name: 'Nguyen Anh Tien',   role: 'customer' },
    ])
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
