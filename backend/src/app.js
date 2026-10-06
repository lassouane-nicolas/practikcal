import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'
import cors from 'cors'
import pool from './config/database.js'
import authRouter from './routes/auth.routes.js'
import goalsRouter from './routes/goals.routes.js'
import foodsRouter from './routes/foods.routes.js'
import journalRouter from './routes/journal.routes.js'

const app = express()

// Global middleware
app.use(express.json())

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}))

// Session configuration
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

// Routes
app.get('/', (req, res) => {
  res.send('PractiKcal API is running')
})

app.use('/auth', authRouter)
app.use('/goals', goalsRouter)
app.use('/foods', foodsRouter)
app.use('/journal', journalRouter)

export default app
