import express from 'express'
import pool from '../config/database.js'
import { requireAuth } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/current', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT
          id,
          daily_calories,
          protein_percentage,
          carbs_percentage,
          fat_percentage,
          fiber_grams,
          effective_from
        FROM nutrition_goal
        WHERE user_id = $1
          AND effective_from <= CURRENT_DATE
        ORDER BY effective_from DESC
        LIMIT 1
      `,
      [req.session.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'No nutrition goal found'
      })
    }

    return res.status(200).json({
      goal: result.rows[0]
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      error: 'Internal server error'
    })
  }
})

export default router
