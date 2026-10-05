import fs from 'node:fs/promises'
import { XMLParser } from 'fast-xml-parser'

process.loadEnvFile('./backend/.env')

const { default: pool } = await import('../../backend/src/config/database.js')

const ALIM_FILE = './database/data/ciqual/alim_2025_11_03.xml'
const COMPO_FILE = './database/data/ciqual/compo_2025_11_03.xml'

const NUTRIENT_CODES = new Set([
  '328',   // Calories
  '25000', // Protein
  '31000', // Carbohydrates
  '34100', // Fiber
  '40000'  // Fat
])

function parseCiqualValue(value) {
  if (!value || value === '-' || value === 'traces' || value.startsWith('<')) {
    return null
  }

  return Number(value.replace(',', '.'))
}

async function upsertCiqualFoods(foods) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    for (const food of foods) {
      const existingFood = await client.query(
        `
          SELECT id
          FROM food
          WHERE source = 'CIQUAL'
            AND external_id = $1
        `,
        [food.externalId]
      )

      if (existingFood.rows.length > 0) {
        await client.query(
          `
            UPDATE food
            SET
              name = $1,
              brand = $2,
              barcode = $3,
              reference_unit = $4,
              calories_per_100 = $5,
              protein_per_100 = $6,
              carbs_per_100 = $7,
              fat_per_100 = $8,
              fiber_per_100 = $9,
              updated_at = CURRENT_TIMESTAMP
            WHERE source = 'CIQUAL'
              AND external_id = $10
          `,
          [
            food.name,
            food.brand,
            food.barcode,
            food.referenceUnit,
            food.caloriesPer100,
            food.proteinPer100,
            food.carbsPer100,
            food.fatPer100,
            food.fiberPer100,
            food.externalId
          ]
        )
      } else {
        await client.query(
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
              'CIQUAL',
              $3,
              $4,
              $5,
              $6,
              $7,
              $8,
              $9,
              $10
            )
          `,
          [
            food.name,
            food.brand,
            food.externalId,
            food.barcode,
            food.referenceUnit,
            food.caloriesPer100,
            food.proteinPer100,
            food.carbsPer100,
            food.fatPer100,
            food.fiberPer100
          ]
        )
      }
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function main() {
  const alimXml = await fs.readFile(ALIM_FILE, 'utf8')

  const parser = new XMLParser({
    trimValues: true,
    parseTagValue: false
  })

  const data = parser.parse(alimXml)
  const foods = data.TABLE.ALIM
  const compoXml = await fs.readFile(COMPO_FILE, 'utf8')
  const compoData = parser.parse(compoXml)
  const compositions = compoData.TABLE.COMPO

  const usefulCompositions = compositions.filter((composition) =>
    NUTRIENT_CODES.has(composition.const_code)
  )

  const nutrientsByFood = new Map()

  for (const composition of usefulCompositions) {
    const foodId = composition.alim_code

    if (!nutrientsByFood.has(foodId)) {
      nutrientsByFood.set(foodId, {
        caloriesPer100: null,
        proteinPer100: null,
        carbsPer100: null,
        fatPer100: null,
        fiberPer100: null
      })
    }

    const nutrients = nutrientsByFood.get(foodId)
    const value = parseCiqualValue(composition.teneur)

    switch (composition.const_code) {
      case '328':
        nutrients.caloriesPer100 = value
        break
      case '25000':
        nutrients.proteinPer100 = value
        break
      case '31000':
        nutrients.carbsPer100 = value
        break
      case '34100':
        nutrients.fiberPer100 = value
        break
      case '40000':
        nutrients.fatPer100 = value
        break
    }
  }

  const normalizedFoods = foods.map((food) => {
    const nutrients = nutrientsByFood.get(food.alim_code)

    return {
      name: food.alim_nom_fr,
      brand: null,
      source: 'CIQUAL',
      externalId: food.alim_code,
      barcode: null,
      referenceUnit: 'g',
      caloriesPer100: nutrients?.caloriesPer100 ?? null,
      proteinPer100: nutrients?.proteinPer100 ?? null,
      carbsPer100: nutrients?.carbsPer100 ?? null,
      fatPer100: nutrients?.fatPer100 ?? null,
      fiberPer100: nutrients?.fiberPer100 ?? null
    }
  })

  await upsertCiqualFoods(normalizedFoods)

  console.log(`Ciqual import completed: ${normalizedFoods.length} foods`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
