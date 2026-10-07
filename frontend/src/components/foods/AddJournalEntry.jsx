import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  Clock3,
  Heart,
  ScanLine,
  Search
} from 'lucide-react'

import Button from '../ui/Button'
import FeedbackMessage from '../ui/FeedbackMessage'
import InputField from '../ui/InputField'
import QuickActionButton from '../ui/QuickActionButton'

function AddJournalEntry() {
  const [search, setSearch] = useState('')
  const [foods, setFoods] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFood, setSelectedFood] = useState(null)
  const [quantity, setQuantity] = useState('100')

  const navigate = useNavigate()

  async function handleFoodSelect(food) {
    setError('')

    try {
      if (food.source === 'OFF' && !food.id) {
        const response = await fetch(
          `http://localhost:3000/foods/off/${food.barcode}`,
          {
            method: 'POST',
            credentials: 'include'
          }
        )

        if (!response.ok) {
          throw new Error('Food synchronization failed')
        }

        const data = await response.json()
        setSelectedFood(data.food)
        return
      }

      setSelectedFood(food)
    } catch (error) {
      setSelectedFood(null)
      setError('Impossible de charger cet aliment.')
    }
  }

  useEffect(() => {
    const query = search.trim()

    if (!query) {
      setFoods([])
      setError('')
      setIsLoading(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await fetch(
          `http://localhost:3000/foods?search=${encodeURIComponent(query)}`,
          {
            credentials: 'include'
          }
        )

        if (!response.ok) {
          throw new Error('Search failed')
        }

        const data = await response.json()
        setFoods(data.foods)
      } catch (error) {
        setFoods([])
        setError('Impossible de rechercher les aliments.')
      } finally {
        setIsLoading(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [search])

  const referenceUnit =
    selectedFood?.reference_unit ??
    selectedFood?.referenceUnit ??
    'g'

  const caloriesPer100 =
    selectedFood?.calories_per_100 ??
    selectedFood?.caloriesPer100

  const proteinPer100 =
    selectedFood?.protein_per_100 ??
    selectedFood?.proteinPer100

  const carbsPer100 =
    selectedFood?.carbs_per_100 ??
    selectedFood?.carbsPer100

  const fatPer100 =
    selectedFood?.fat_per_100 ??
    selectedFood?.fatPer100

  const quantityNumber = Number(quantity)
  const factor =
    Number.isFinite(quantityNumber) && quantityNumber > 0
      ? quantityNumber / 100
      : 0

  function calculateNutrient(value) {
    if (value === null || value === undefined) {
      return null
    }

    return Math.round(Number(value) * factor * 10) / 10
  }

  const calculatedCalories = calculateNutrient(caloriesPer100)
  const calculatedProtein = calculateNutrient(proteinPer100)
  const calculatedCarbs = calculateNutrient(carbsPer100)
  const calculatedFat = calculateNutrient(fatPer100)

  if (selectedFood) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] px-5 pt-5 pb-24">
        <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-sm flex-col">
          <header className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedFood(null)}
              aria-label="Retour aux résultats"
              className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--color-primary)]
            "
            >
              <ChevronLeft
                aria-hidden="true"
                className="h-5 w-5"
              />
            </button>

            <h1 className="truncate text-2xl font-bold">
              {selectedFood.name}
            </h1>
          </header>

          <div className="mt-6">
            <p className="font-medium">
              {selectedFood.name}
            </p>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {selectedFood.source}
            </p>
          </div>

          <section
            className="
            mt-6
            rounded-2xl
            border
            border-[var(--color-border)]
            bg-sky-50
            p-4
          "
          >
            <InputField
              id="food-quantity"
              label="Quantité"
              type="number"
              min="1"
              step="1"
              suffix={referenceUnit}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />

            <div className="mt-4 border-t border-[var(--color-border)] pt-4">
              <p className="text-sm font-medium">
                Apports
              </p>

              <p className="mt-2 text-lg font-semibold text-[var(--color-primary)]">
                {calculatedCalories ?? '—'} kcal
              </p>

              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Protéines {calculatedProtein ?? '—'} g
                {' · '}
                Glucides {calculatedCarbs ?? '—'} g
                {' · '}
                Lipides {calculatedFat ?? '—'} g
              </p>
            </div>
          </section>

          <div className="mt-auto pt-8">
            <Button disabled={!quantityNumber || quantityNumber <= 0}>
              Ajouter au déjeuner
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-5 pt-5 pb-24">
      <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-sm flex-col">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Retour"
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--color-primary)]
            "
          >
            <ChevronLeft
              aria-hidden="true"
              className="h-5 w-5"
            />
          </button>

          <h1 className="text-xl font-bold">
            Déjeuner
          </h1>
        </header>

        <section
          aria-label="Actions rapides"
          className="mt-4 grid grid-cols-3 gap-2"
        >
          <QuickActionButton icon={Clock3}>
            Récents
          </QuickActionButton>

          <QuickActionButton icon={Heart}>
            Favoris
          </QuickActionButton>

          <QuickActionButton icon={ScanLine}>
            Scan
          </QuickActionButton>
        </section>

        <section className="mt-3">
          <InputField
            id="food-search"
            type="search"
            ariaLabel="Rechercher un aliment ou une recette"
            icon={Search}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un aliment, une recette..."
          />
        </section>

        <nav
          aria-label="Type de contenu"
          className="
            mt-3
            grid
            grid-cols-3
            border-b
            border-[var(--color-border)]
          "
        >
          <button
            type="button"
            className="
              border-b-2
              border-[var(--color-primary)]
              px-2
              py-3
              text-sm
              font-semibold
              text-[var(--color-primary)]
            "
          >
            Aliments
          </button>

          <button
            type="button"
            className="
              px-2
              py-3
              text-sm
              text-[var(--color-text-muted)]
            "
          >
            Recettes
          </button>

          <button
            type="button"
            className="
              px-2
              py-3
              text-sm
              text-[var(--color-text-muted)]
            "
          >
            Repas
          </button>
        </nav>

        <section
          aria-live="polite"
          className="mt-4 flex-1"
        >
          {isLoading && (
            <p className="text-sm text-[var(--color-text-muted)]">
              Recherche...
            </p>
          )}

          {error && (
            <FeedbackMessage type="error">
              {error}
            </FeedbackMessage>
          )}

          {!isLoading &&
            !error &&
            search.trim() &&
            foods.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)]">
                Aucun aliment trouvé.
              </p>
            )}

          {!isLoading && !error && foods.length > 0 && (
            <ul className="divide-y divide-[var(--color-border)]">
              {foods.map((food) => (
                <li
                  key={`${food.source}-${food.id ?? food.externalId}`}
                  className="py-3"
                >
                  <button
                    type="button"
                    onClick={() => handleFoodSelect(food)}
                    className="
                      w-full
                      rounded-lg
                      px-1
                      py-1
                      text-left
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[var(--color-primary)]
                    "
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {food.name}
                        </p>

                        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                          {food.source}
                        </p>

                        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                          Pour 100 {food.reference_unit ?? food.referenceUnit ?? 'g'}
                        </p>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                          Protéines {food.protein_per_100 ?? food.proteinPer100 ?? '—'} g
                          {' · '}
                          Glucides {food.carbs_per_100 ?? food.carbsPer100 ?? '—'} g
                          {' · '}
                          Lipides {food.fat_per_100 ?? food.fatPer100 ?? '—'} g
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-semibold text-[var(--color-primary)]">
                        {food.calories_per_100 ??
                          food.caloriesPer100 ??
                          '—'}{' '}
                        kcal
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-6">
          <Button>
            Terminer
          </Button>
        </div>
      </div>
    </main>
  )
}

export default AddJournalEntry
