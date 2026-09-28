import express from 'express'
import pool from '../config/database.js'
import { requireAuth } from '../middlewares/auth.middleware.js'

const router = express.Router()

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

export default router
