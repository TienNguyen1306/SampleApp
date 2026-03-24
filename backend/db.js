import mongoose from 'mongoose'
import { MONGODB_URI } from './config.js'

export async function connectDB() {
  try {
    let uri = MONGODB_URI

    // Nếu không có URI thật → dùng mongodb-memory-server (dev/test)
    if (!uri || uri === 'local') {
      const { MongoMemoryServer } = await import('mongodb-memory-server')
      const mongod = await MongoMemoryServer.create()
      uri = mongod.getUri()
      console.log('🧪 Using in-memory MongoDB:', uri)
    }

    await mongoose.connect(uri)
    console.log('✅ MongoDB connected')
  } catch (err) {
    console.error('❌ MongoDB connection error:', err)
    process.exit(1)
  }
}
