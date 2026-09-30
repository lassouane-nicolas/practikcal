import express from 'express'
import pool from '../config/database.js'
import { requireAuth } from '../middlewares/auth.middleware.js'

const router = express.Router()

function validateFood({
  name,
  referenceUnit,
  caloriesPer100,
  proteinPer100,
  carbsPer100,
  fatPer100,
  fiberPer100
}) {
  if (!name || !name.trim()) {
    return 'Food name is required'
  }

  if (!['g', 'ml'].includes(referenceUnit)) {
    return 'Reference unit must be g or ml'
  }

  const nutritionValues = [
    caloriesPer100,
    proteinPer100,
    carbsPer100,
    fatPer100,
    fiberPer100
  ]

  const hasNegativeValue = nutritionValues.some(
    value => value !== undefined && value !== null && value < 0
  )

  if (hasNegativeValue) {
    return 'Nutrition values must be greater than or equal to 0'
  }

  return null
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const { search } = req.query

    if (!search || !search.trim()) {
      return res.status(400).json({
        error: 'Search query is required'
      })
    }

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        brand,
        source,
        external_id,
        barcode,
        reference_unit,
        calories_per_100,
        protein_per_100,
        carbs_per_100,
        fat_per_100,
        fiber_per_100
      FROM food
      WHERE
        LOWER(name) LIKE LOWER($1)
        AND (
          source IN ('OFF', 'CIQUAL')
          OR user_id = $2
        )
      ORDER BY name ASC
      `,
      [`%${search.trim()}%`, req.session.userId]
    )

    return res.status(200).json({
      foods: result.rows
    })

  } catch (error) {
    console.error(error)

    return res.status(500).json({
      error: 'Internal server error'
    })
  }
})

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const foodId = Number(req.params.id)

    if (!Number.isInteger(foodId) || foodId <= 0) {
      return res.status(400).json({
        error: 'Invalid food id'
      })
    }

    const result = await pool.query(
      `
        SELECT
          id,
          name,
          brand,
          source,
          external_id,
          barcode,
          reference_unit,
          calories_per_100,
          protein_per_100,
          carbs_per_100,
          fat_per_100,
          fiber_per_100
        FROM food
        WHERE id = $1
          AND (
            source IN ('OFF', 'CIQUAL')
            OR user_id = $2
          )
      `,
      [foodId, req.session.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Food not found'
      })
    }

    return res.status(200).json({
      food: result.rows[0]
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
      name,
      brand,
      referenceUnit,
      caloriesPer100,
      proteinPer100,
      carbsPer100,
      fatPer100,
      fiberPer100
    } = req.body

    const validationError = validateFood({
      name,
      referenceUnit,
      caloriesPer100,
      proteinPer100,
      carbsPer100,
      fatPer100,
      fiberPer100
    })

    if (validationError) {
      return res.status(400).json({
        error: validationError
      })
    }

    const result = await pool.query(
      `
        INSERT INTO food (
          user_id,
          name,
          brand,
          source,
          reference_unit,
          calories_per_100,
          protein_per_100,
          carbs_per_100,
          fat_per_100,
          fiber_per_100
        )
        VALUES ($1, $2, $3, 'USER', $4, $5, $6, $7, $8, $9)
        RETURNING
          id,
          name,
          brand,
          source,
          reference_unit,
          calories_per_100,
          protein_per_100,
          carbs_per_100,
          fat_per_100,
          fiber_per_100
      `,
      [
        req.session.userId,
        name.trim(),
        brand ?? null,
        referenceUnit,
        caloriesPer100 ?? null,
        proteinPer100 ?? null,
        carbsPer100 ?? null,
        fatPer100 ?? null,
        fiberPer100 ?? null
      ]
    )

    return res.status(201).json({
      food: result.rows[0]
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      error: 'Internal server error'
    })
  }
})

export default router
