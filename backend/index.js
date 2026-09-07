import 'dotenv/config'
import express from 'express'

const app = express()
const PORT = process.env.PORT

app.get('/', (req, res) => {
  res.send('PractiKcal API is running')
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
