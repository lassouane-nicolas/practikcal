import express from 'express'
import { requireAuth } from '../middlewares/auth.middleware.js'
import pool from '../config/database.js'

const router = express.Router()

router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      foodId,
      entryDate,
      mealType,
      quantity,
      quantityMode,
      foodPortionId
    } = req.body

    const allowedMealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']
    const allowedQuantityModes = ['REFERENCE', 'PORTION']

    if (!Number.isInteger(foodId) || foodId <= 0) {
      return res.status(400).json({
        error: 'Invalid food id'
      })
    }

    if (!entryDate || !/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) {
      return res.status(400).json({
        error: 'Invalid entry date'
      })
    }

    if (!allowedMealTypes.includes(mealType)) {
      return res.status(400).json({
        error: 'Invalid meal type'
      })
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({
        error: 'Quantity must be greater than 0'
      })
    }

    if (!allowedQuantityModes.includes(quantityMode)) {
      return res.status(400).json({
        error: 'Invalid quantity mode'
      })
    }

    if (
      quantityMode === 'PORTION' &&
      (!Number.isInteger(foodPortionId) || foodPortionId <= 0)
    ) {
      return res.status(400).json({
        error: 'Food portion is required for portion mode'
      })
    }

    if (
      quantityMode === 'REFERENCE' &&
      foodPortionId !== null &&
      foodPortionId !== undefined
    ) {
      return res.status(400).json({
        error: 'Food portion must be empty for reference mode'
      })
    }

    const foodResult = await pool.query(
      `
    SELECT
      id,
      name,
      source,
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

    if (foodResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Food not found'
      })
    }

    const food = foodResult.rows[0]

    let referenceQuantity

    // In reference mode, the entered quantity is already expressed
    // in the food reference unit (g or ml).
    if (quantityMode === 'REFERENCE') {
      referenceQuantity = quantity
    }

    if (quantityMode === 'PORTION') {
      const portionResult = await pool.query(
        `
      SELECT
        id,
        equivalent_quantity
      FROM food_portion
      WHERE id = $1
        AND food_id = $2
    `,
        [foodPortionId, foodId]
      )

      if (portionResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Food portion not found'
        })
      }

      const portion = portionResult.rows[0]

      // Convert the number of portions to the food reference quantity.
      referenceQuantity =
        quantity * Number(portion.equivalent_quantity)
    }

    // Nutritional values are stored per 100 reference units.
    const factor = referenceQuantity / 100

    // Keep unknown nutrients as null instead of treating them as zero.
    const caloriesSnapshot =
      food.calories_per_100 === null
        ? null
        : Number(food.calories_per_100) * factor

    const proteinSnapshot =
      food.protein_per_100 === null
        ? null
        : Number(food.protein_per_100) * factor

    const carbsSnapshot =
      food.carbs_per_100 === null
        ? null
        : Number(food.carbs_per_100) * factor

    const fatSnapshot =
      food.fat_per_100 === null
        ? null
        : Number(food.fat_per_100) * factor

    const fiberSnapshot =
      food.fiber_per_100 === null
        ? null
        : Number(food.fiber_per_100) * factor

    const result = await pool.query(
      `
    INSERT INTO journal_entry (
      user_id,
      food_id,
      entry_date,
      meal_type,
      quantity,
      quantity_mode,
      reference_quantity_snapshot,
      food_portion_id,
      label,
      calories_snapshot,
      protein_snapshot,
      carbs_snapshot,
      fat_snapshot,
      fiber_snapshot
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10,
      $11,
      $12,
      $13,
      $14
    )
    RETURNING
      id,
      user_id,
      food_id,
      entry_date::text AS entry_date,
      meal_type,
      quantity,
      quantity_mode,
      reference_quantity_snapshot,
      food_portion_id,
      label,
      calories_snapshot,
      protein_snapshot,
      carbs_snapshot,
      fat_snapshot,
      fiber_snapshot,
      created_at,
      updated_at
  `,
      [
        req.session.userId,
        foodId,
        entryDate,
        mealType,
        quantity,
        quantityMode,
        referenceQuantity,
        foodPortionId ?? null,
        food.name,
        caloriesSnapshot,
        proteinSnapshot,
        carbsSnapshot,
        fatSnapshot,
        fiberSnapshot
      ]
    )

    return res.status(201).json({
      journalEntry: result.rows[0]
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      error: 'Internal server error'
    })
  }
})

router.get('/', requireAuth, async (req, res) => {
  try {
    const { date } = req.query

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        error: 'Invalid date'
      })
    }

    const result = await pool.query(
      `
        SELECT
          id,
          food_id,
          entry_date::text AS entry_date,
          meal_type,
          quantity,
          quantity_mode,
          reference_quantity_snapshot,
          food_portion_id,
          label,
          calories_snapshot,
          protein_snapshot,
          carbs_snapshot,
          fat_snapshot,
          fiber_snapshot,
          created_at,
          updated_at
        FROM journal_entry
        WHERE user_id = $1
          AND entry_date = $2
        ORDER BY created_at ASC
      `,
      [req.session.userId, date]
    )

    return res.status(200).json({
      entries: result.rows
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      error: 'Internal server error'
    })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const journalEntryId = Number(req.params.id)

    if (!Number.isInteger(journalEntryId) || journalEntryId <= 0) {
      return res.status(400).json({
        error: 'Invalid journal entry id'
      })
    }

    const existingEntry = await pool.query(
      `
        SELECT id
        FROM journal_entry
        WHERE id = $1
          AND user_id = $2
      `,
      [journalEntryId, req.session.userId]
    )

    if (existingEntry.rows.length === 0) {
      return res.status(404).json({
        error: 'Journal entry not found'
      })
    }

    const {
      foodId,
      entryDate,
      mealType,
      quantity,
      quantityMode,
      foodPortionId
    } = req.body

    const allowedMealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']
    const allowedQuantityModes = ['REFERENCE', 'PORTION']

    if (!Number.isInteger(foodId) || foodId <= 0) {
      return res.status(400).json({
        error: 'Invalid food id'
      })
    }

    if (!entryDate || !/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) {
      return res.status(400).json({
        error: 'Invalid entry date'
      })
    }

    if (!allowedMealTypes.includes(mealType)) {
      return res.status(400).json({
        error: 'Invalid meal type'
      })
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({
        error: 'Quantity must be greater than 0'
      })
    }

    if (!allowedQuantityModes.includes(quantityMode)) {
      return res.status(400).json({
        error: 'Invalid quantity mode'
      })
    }

    if (
      quantityMode === 'PORTION' &&
      (!Number.isInteger(foodPortionId) || foodPortionId <= 0)
    ) {
      return res.status(400).json({
        error: 'Food portion is required for portion mode'
      })
    }

    if (
      quantityMode === 'REFERENCE' &&
      foodPortionId !== null &&
      foodPortionId !== undefined
    ) {
      return res.status(400).json({
        error: 'Food portion must be empty for reference mode'
      })
    }

    const foodResult = await pool.query(
      `
    SELECT
      id,
      name,
      source,
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

    if (foodResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Food not found'
      })
    }

    const food = foodResult.rows[0]

    let referenceQuantity

    // In reference mode, the entered quantity is already expressed
    // in the food reference unit (g or ml).
    if (quantityMode === 'REFERENCE') {
      referenceQuantity = quantity
    }

    if (quantityMode === 'PORTION') {
      const portionResult = await pool.query(
        `
      SELECT
        id,
        equivalent_quantity
      FROM food_portion
      WHERE id = $1
        AND food_id = $2
    `,
        [foodPortionId, foodId]
      )

      if (portionResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Food portion not found'
        })
      }

      const portion = portionResult.rows[0]

      // Convert the number of portions to the food reference quantity.
      referenceQuantity =
        quantity * Number(portion.equivalent_quantity)
    }

    // Nutritional values are stored per 100 reference units.
    const factor = referenceQuantity / 100

    // Keep unknown nutrients as null instead of treating them as zero.
    const caloriesSnapshot =
      food.calories_per_100 === null
        ? null
        : Number(food.calories_per_100) * factor

    const proteinSnapshot =
      food.protein_per_100 === null
        ? null
        : Number(food.protein_per_100) * factor

    const carbsSnapshot =
      food.carbs_per_100 === null
        ? null
        : Number(food.carbs_per_100) * factor

    const fatSnapshot =
      food.fat_per_100 === null
        ? null
        : Number(food.fat_per_100) * factor

    const fiberSnapshot =
      food.fiber_per_100 === null
        ? null
        : Number(food.fiber_per_100) * factor

    const result = await pool.query(
      `
    UPDATE journal_entry
    SET
      food_id = $1,
      entry_date = $2,
      meal_type = $3,
      quantity = $4,
      quantity_mode = $5,
      reference_quantity_snapshot = $6,
      food_portion_id = $7,
      label = $8,
      calories_snapshot = $9,
      protein_snapshot = $10,
      carbs_snapshot = $11,
      fat_snapshot = $12,
      fiber_snapshot = $13,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $14
      AND user_id = $15
    RETURNING
      id,
      user_id,
      food_id,
      entry_date::text AS entry_date,
      meal_type,
      quantity,
      quantity_mode,
      reference_quantity_snapshot,
      food_portion_id,
      label,
      calories_snapshot,
      protein_snapshot,
      carbs_snapshot,
      fat_snapshot,
      fiber_snapshot,
      created_at,
      updated_at
  `,
      [
        foodId,
        entryDate,
        mealType,
        quantity,
        quantityMode,
        referenceQuantity,
        foodPortionId ?? null,
        food.name,
        caloriesSnapshot,
        proteinSnapshot,
        carbsSnapshot,
        fatSnapshot,
        fiberSnapshot,
        journalEntryId,
        req.session.userId
      ]
    )

    return res.status(200).json({
      journalEntry: result.rows[0]
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      error: 'Internal server error'
    })
  }
})

export default router
