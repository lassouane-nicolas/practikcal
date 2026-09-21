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

router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      dailyCalories,
      proteinPercentage,
      carbsPercentage,
      fatPercentage,
      fiberGrams
    } = req.body

    if (
      dailyCalories === undefined ||
      proteinPercentage === undefined ||
      carbsPercentage === undefined ||
      fatPercentage === undefined ||
      fiberGrams === undefined
    ) {
      return res.status(400).json({
        error: 'All nutrition goal fields are required'
      })
    }

    if (dailyCalories <= 0) {
      return res.status(400).json({
        error: 'Daily calories must be greater than 0'
      })
    }

    if (
      proteinPercentage < 0 ||
      carbsPercentage < 0 ||
      fatPercentage < 0
    ) {
      return res.status(400).json({
        error: 'Macronutrient percentages must be greater than or equal to 0'
      })
    }

    if (
      proteinPercentage +
      carbsPercentage +
      fatPercentage !==
      100
    ) {
      return res.status(400).json({
        error: 'Macronutrient percentages must total 100'
      })
    }

    if (fiberGrams < 0) {
      return res.status(400).json({
        error: 'Fiber goal must be greater than or equal to 0'
      })
    }

    const result = await pool.query(
      `
        INSERT INTO nutrition_goal (
          user_id,
          daily_calories,
          protein_percentage,
          carbs_percentage,
          fat_percentage,
          fiber_grams,
          effective_from
        )
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
        RETURNING
          id,
          daily_calories,
          protein_percentage,
          carbs_percentage,
          fat_percentage,
          fiber_grams,
          effective_from
      `,
      [
        req.session.userId,
        dailyCalories,
        proteinPercentage,
        carbsPercentage,
        fatPercentage,
        fiberGrams
      ]
    )

    return res.status(201).json({
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
