import pool from '../config/database.js'
import {
  getOpenFoodFactsProduct,
  searchOpenFoodFacts
} from './openFoodFacts.service.js'

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

export async function syncOpenFoodFactsProduct(barcode) {
  const product = await getOpenFoodFactsProduct(barcode)

  if (!product.name || !product.referenceUnit) {
    const error = new Error('Open Food Facts product is incomplete')
    error.code = 'OFF_PRODUCT_INCOMPLETE'

    throw error
  }

  const existingFood = await pool.query(
    `
      SELECT id
      FROM food
      WHERE source = 'OFF'
        AND barcode = $1
      LIMIT 1
    `,
    [barcode]
  )

  if (existingFood.rows.length > 0) {
    if (existingFood.rows.length > 0) {
      const result = await pool.query(
        `
      UPDATE food
      SET
        name = $1,
        brand = $2,
        external_id = $3,
        reference_unit = $4,
        calories_per_100 = $5,
        protein_per_100 = $6,
        carbs_per_100 = $7,
        fat_per_100 = $8,
        fiber_per_100 = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `,
        [
          product.name,
          product.brand,
          product.externalId,
          product.referenceUnit,
          product.caloriesPer100,
          product.proteinPer100,
          product.carbsPer100,
          product.fatPer100,
          product.fiberPer100,
          existingFood.rows[0].id
        ]
      )

      return result.rows[0]
    }
  }

  const result = await pool.query(
    `
    INSERT INTO food (
      user_id,
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
    )
    VALUES (
      NULL,
      $1,
      $2,
      'OFF',
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10
    )
    RETURNING *
  `,
    [
      product.name,
      product.brand,
      product.externalId,
      product.barcode,
      product.referenceUnit,
      product.caloriesPer100,
      product.proteinPer100,
      product.carbsPer100,
      product.fatPer100,
      product.fiberPer100
    ]
  )

  return result.rows[0]
}
