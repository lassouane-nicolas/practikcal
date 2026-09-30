import pool from '../config/database.js'
import { searchOpenFoodFacts } from './openFoodFacts.service.js'

export async function searchLocalFoods(search, userId) {
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
    [`%${search.trim()}%`, userId]
  )

  return result.rows
}

export async function searchFoods(search, userId) {
  const localFoods = await searchLocalFoods(search, userId)
  const externalFoods = await searchOpenFoodFacts(search)

  return [...localFoods, ...externalFoods]
}
