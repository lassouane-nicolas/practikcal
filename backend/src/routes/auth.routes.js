import express from 'express'
import pool from '../config/database.js'
import argon2 from 'argon2'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      })
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Email format is invalid'
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'The password must be at least 8 characters long'
      })
    }

    const result = await pool.query(
      'SELECT id FROM app_user WHERE email = $1',
      [email]
    )

    if (result.rows.length > 0) {
      return res.status(409).json({
        error: 'Email already in use'
      })
    }

    const passwordHash = await argon2.hash(password)

    await pool.query(
      'INSERT INTO app_user (email, password_hash) VALUES ($1, $2)',
      [email, passwordHash]
    )

    return res.status(201).json({
      message: 'User registered successfully'
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      error: 'Internal server error'
    })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      })
    }

    const result = await pool.query(
      'SELECT id, password_hash FROM app_user WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid email or password'
      })
    }

    const user = result.rows[0]
    const passwordIsValid = await argon2.verify(
      user.password_hash,
      password
    )

    if (!passwordIsValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      })
    }

    req.session.userId = user.id

    return res.status(200).json({
      message: 'Login successful'
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      error: 'Internal server error'
    })
  }
})

router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      error: 'Not authenticated'
    })
  }

  try {
    const result = await pool.query(
      'SELECT id, email FROM app_user WHERE id = $1',
      [req.session.userId]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Not authenticated'
      })
    }

    return res.status(200).json({
      user: result.rows[0]
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      error: 'Internal server error'
    })
  }
})

router.post('/logout', (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error(error)

      return res.status(500).json({
        error: 'Internal server error'
      })
    }

    res.clearCookie('connect.sid')

    return res.status(200).json({
      message: 'Logout successful'
    })
  })
})

export default router
