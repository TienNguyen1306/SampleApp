import app from './backend/app.js'
import { PORT } from './backend/config.js'

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
