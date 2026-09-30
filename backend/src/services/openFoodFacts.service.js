const SEARCH_URL = 'https://search.openfoodfacts.org/search'

function getCaloriesPer100(nutriments) {
  const kcal = nutriments?.['energy-kcal_100g']
  const kj = nutriments?.['energy-kj_100g']

  if (kcal !== undefined && kcal !== null) {
    return kcal
  }

  if (kj !== undefined && kj !== null) {
    return kj / 4.184
  }

  return null
}

// Search-a-licious results are incomplete and must be enriched before becoming valid Food entities.
function normalizeOpenFoodFactsSearchResult(product) {
  return {
    name: product.product_name ?? null,
    brand: product.brands?.filter(Boolean).join(', ') || null,
    source: 'OFF',
    externalId: product.code ?? null,
    barcode: product.code ?? null,
    caloriesPer100: getCaloriesPer100(product.nutriments),
    proteinPer100: product.nutriments?.proteins_100g ?? null,
    carbsPer100: product.nutriments?.carbohydrates_100g ?? null,
    fatPer100: product.nutriments?.fat_100g ?? null,
    fiberPer100: product.nutriments?.fiber_100g ?? null
  }
}

export async function searchOpenFoodFacts(search) {
  const response = await fetch(SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'PractiKcal - Open Food Facts integration'
    },
    body: JSON.stringify({
      q: search.trim(),
      page_size: 5,
      langs: ['fr', 'en'],
      fields: [
        'code',
        'product_name',
        'brands',
        'product_quantity_unit',
        'nutrition_data_per',
        'nutriments'
      ]
    })
  })

  if (!response.ok) {
    throw new Error(`Open Food Facts request failed: ${response.status}`)
  }

  const data = await response.json()

  return data.hits.map(normalizeOpenFoodFactsSearchResult)
}

function getReferenceUnit(product) {
  if (product.nutrition_data_per === '100g') {
    return 'g'
  }

  if (product.nutrition_data_per === '100ml') {
    return 'ml'
  }

  return null
}

function normalizeOpenFoodFactsProduct(product) {
  return {
    name: product.product_name ?? null,
    brand: product.brands ?? null,
    source: 'OFF',
    externalId: product.code ?? null,
    barcode: product.code ?? null,
    referenceUnit: getReferenceUnit(product),
    caloriesPer100: getCaloriesPer100(product.nutriments),
    proteinPer100: product.nutriments?.proteins_100g ?? null,
    carbsPer100: product.nutriments?.carbohydrates_100g ?? null,
    fatPer100: product.nutriments?.fat_100g ?? null,
    fiberPer100: product.nutriments?.fiber_100g ?? null
  }
}

const PRODUCT_URL = 'https://world.openfoodfacts.org/api/v3/product'

// Product details are enriched before being converted into a valid Food entity.
export async function getOpenFoodFactsProduct(barcode) {
  const fields = [
    'code',
    'product_name',
    'brands',
    'product_quantity_unit',
    'nutrition_data_per',
    'nutriments'
  ].join(',')

  const response = await fetch(
    `${PRODUCT_URL}/${barcode}?fields=${fields}`,
    {
      headers: {
        'User-Agent': 'PractiKcal/0.1'
      }
    }
  )

  if (!response.ok) {
    throw new Error(`Open Food Facts product request failed: ${response.status}`)
  }

  const data = await response.json()

  return normalizeOpenFoodFactsProduct(data.product)
}
