import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'
import pool from './src/config/database.js'
import authRouter from './src/routes/auth.routes.js'

const app = express()

app.use(express.json())

const PgSession = connectPgSimple(session)

app.use(
  session({
    store: new PgSession({
      pool
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
)

const PORT = process.env.PORT

app.get('/', (req, res) => {
  res.send('PractiKcal API is running')
})

app.use('/auth', authRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
