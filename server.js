import app from './backend/app.js'
import { PORT } from './backend/config.js'
import { connectDB } from './backend/db.js'
import { seedDatabase } from './backend/seed.js'

async function start() {
  await connectDB()
  await seedDatabase()
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`)
  })
}

start()
