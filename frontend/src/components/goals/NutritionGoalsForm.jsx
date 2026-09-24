import { useEffect, useState } from 'react'
import { ChevronLeft, Info } from 'lucide-react'
import Button from '../ui/Button'
import InputField from '../ui/InputField'
import FeedbackMessage from '../ui/FeedbackMessage'

function NutritionGoalsForm() {
  const [dailyCalories, setDailyCalories] = useState('')
  const [proteinPercentage, setProteinPercentage] = useState(15)
  const [carbsPercentage, setCarbsPercentage] = useState(50)
  const [fatPercentage, setFatPercentage] = useState(35)
  const [fiberGrams, setFiberGrams] = useState(30)
  const [isLoading, setIsLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [hasExistingGoal, setHasExistingGoal] = useState(false)
  const [macroMode, setMacroMode] = useState('default')
  const [customProteinPercentage, setCustomProteinPercentage] = useState(15)
  const [customCarbsPercentage, setCustomCarbsPercentage] = useState(50)
  const [customFatPercentage, setCustomFatPercentage] = useState(35)

  useEffect(() => {
    async function fetchCurrentGoal() {
      try {
        const response = await fetch('http://localhost:3000/goals/current', {
          credentials: 'include'
        })

        if (response.status === 404) {
          return
        }

        if (!response.ok) {
          setError('Impossible de charger les objectifs.')
          return
        }

        const data = await response.json()
        const goal = data.goal

        setHasExistingGoal(true)
        setDailyCalories(goal.daily_calories)
        setProteinPercentage(goal.protein_percentage)
        setCarbsPercentage(goal.carbs_percentage)
        setFatPercentage(goal.fat_percentage)
        setFiberGrams(goal.fiber_grams)

        const usesDefaultMacros =
          Number(goal.protein_percentage) === 15 &&
          Number(goal.carbs_percentage) === 50 &&
          Number(goal.fat_percentage) === 35

        setMacroMode(usesDefaultMacros ? 'default' : 'custom')

        if (!usesDefaultMacros) {
          setCustomProteinPercentage(goal.protein_percentage)
          setCustomCarbsPercentage(goal.carbs_percentage)
          setCustomFatPercentage(goal.fat_percentage)
        }
      } catch (error) {
        setError('Impossible de joindre le serveur.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentGoal()
  }, [])

  useEffect(() => {
    if (!success) {
      return
    }

    const timeoutId = setTimeout(() => {
      setSuccess('')
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [success])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const macroTotal =
      Number(proteinPercentage) +
      Number(carbsPercentage) +
      Number(fatPercentage)

    if (Number(dailyCalories) <= 0) {
      setError('L’objectif calorique doit être supérieur à 0.')
      return
    }

    if (macroTotal !== 100) {
      setError('La répartition des macronutriments doit totaliser 100 %.')
      return
    }

    if (Number(fiberGrams) < 0) {
      setError('L’objectif de fibres doit être supérieur ou égal à 0.')
      return
    }

    const method = hasExistingGoal ? 'PUT' : 'POST'
    const endpoint = hasExistingGoal
      ? 'http://localhost:3000/goals/current'
      : 'http://localhost:3000/goals'

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          dailyCalories: Number(dailyCalories),
          proteinPercentage: Number(proteinPercentage),
          carbsPercentage: Number(carbsPercentage),
          fatPercentage: Number(fatPercentage),
          fiberGrams: Number(fiberGrams)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Impossible d’enregistrer les objectifs.')
        return
      }

      setHasExistingGoal(true)
      setSuccess('Objectifs enregistrés.')
    } catch (error) {
      setError('Impossible de joindre le serveur.')
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] px-6 py-8">
        <div className="mx-auto w-full max-w-sm">
          <p
            role="status"
            className="text-sm text-[var(--color-text-muted)]"
          >
            Chargement des objectifs...
          </p>
        </div>
      </main>
    )
  }

  const proteinGrams = Math.round(
    (Number(dailyCalories) * Number(proteinPercentage) / 100) / 4
  )

  const carbsGrams = Math.round(
    (Number(dailyCalories) * Number(carbsPercentage) / 100) / 4
  )

  const fatGrams = Math.round(
    (Number(dailyCalories) * Number(fatPercentage) / 100) / 9
  )

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-6 py-8">
      <div className="mx-auto w-full max-w-sm">

        {/* Header */}
        <header className="
                            sticky
                            top-8
                            z-10
                            flex
                            items-center
                            gap-3
                            bg-[var(--color-background)]
                            py-2
                        "
        >
          <button
            type="button"
            aria-label="Retour"
            className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-full
                            text-[var(--color-text)]
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-[var(--color-primary)]
                        "
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          <h1 className="text-2xl font-bold">
            Objectifs nutritionnels
          </h1>
        </header>

        {/* Energy goal */}
        <form onSubmit={handleSubmit}>
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
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">
                Objectif énergétique
              </h2>

              <Info
                className="h-4 w-4 text-[var(--color-primary)]"
                aria-hidden="true"
              />
            </div>

            <div className="mt-4 flex items-end gap-3">
              <div className="w-28">
                <InputField
                  id="daily-calories"
                  label=""
                  ariaLabel="Objectif calorique quotidien"
                  type="number"
                  value={dailyCalories}
                  onChange={(event) => setDailyCalories(event.target.value)}
                />
              </div>

              <span className="pb-3 text-sm text-[var(--color-text-muted)]">
                kcal / jour
              </span>
            </div>
          </section>

          {/* Macronutrient goal */}
          <section
            className="
                            mt-5
                            rounded-2xl
                            border
                            border-[var(--color-border)]
                            bg-sky-50
                            p-4
                        "
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">
                Répartition des macronutriments
              </h2>

              <Info
                className="h-4 w-4 text-[var(--color-primary)]"
                aria-hidden="true"
              />
            </div>

            {/* Macro mode selector */}
            <div
              className="
                                mt-4
                                grid
                                grid-cols-2
                                overflow-hidden
                                rounded-xl
                                bg-[var(--color-background)]
                            "
              role="radiogroup"
              aria-label="Mode de répartition des macronutriments"
            >
              <button
                type="button"
                role="radio"
                aria-checked={macroMode === 'default'}
                onClick={() => {
                  setMacroMode('default')
                  setProteinPercentage(15)
                  setCarbsPercentage(50)
                  setFatPercentage(35)
                }}
                className={`
                                    rounded-lg
                                    px-3
                                    py-2
                                    text-sm
                                    font-medium
                                    transition
                                    ${macroMode === 'default'
                    ? 'bg-sky-100 text-[var(--color-primary)]'
                    : 'text-[var(--color-text-muted)]'
                  }
                                `}
              >
                Par défaut
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={macroMode === 'custom'}
                onClick={() => {
                  setMacroMode('custom')
                  setProteinPercentage(customProteinPercentage)
                  setCarbsPercentage(customCarbsPercentage)
                  setFatPercentage(customFatPercentage)
                }}
                className={`
                                    rounded-lg
                                    px-3
                                    py-2
                                    text-sm
                                    font-medium
                                    transition
                                    ${macroMode === 'custom'
                    ? 'bg-sky-100 text-[var(--color-primary)]'
                    : 'text-[var(--color-text-muted)]'
                  }
                                `}
              >
                Personnalisée
              </button>
            </div>

            {/* Macronutrient distribution */}
            {macroMode === 'default' ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 leading-5">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-protein)]" />
                    <span>Protéines</span>
                  </div>

                  <div className="text-right leading-5">
                    <p className="font-medium">{proteinPercentage}%</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {proteinGrams} g
                    </p>
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 leading-5">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-carbs)]" />
                    <span>Glucides</span>
                  </div>

                  <div className="text-right leading-5">
                    <p className="font-medium">{carbsPercentage}%</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {carbsGrams} g
                    </p>
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 leading-5">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-fat)]" />
                    <span>Lipides</span>
                  </div>

                  <div className="text-right leading-5">
                    <p className="font-medium">{fatPercentage}%</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {fatGrams} g
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-protein)]" />
                    <span>Protéines</span>
                  </div>

                  <div className="w-24">
                    <InputField
                      id="protein-percentage"
                      label=""
                      ariaLabel="Pourcentage de protéines"
                      type="number"
                      suffix="%"
                      value={proteinPercentage}
                      onChange={(event) => {
                        const value = event.target.value
                        setProteinPercentage(value)
                        setCustomProteinPercentage(value)
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-carbs)]" />
                    <span>Glucides</span>
                  </div>

                  <div className="w-24">
                    <InputField
                      id="carbs-percentage"
                      label=""
                      ariaLabel="Pourcentage de glucides"
                      type="number"
                      suffix="%"
                      value={carbsPercentage}
                      onChange={(event) => {
                        const value = event.target.value
                        setCarbsPercentage(value)
                        setCustomCarbsPercentage(value)
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-fat)]" />
                    <span>Lipides</span>
                  </div>

                  <div className="w-24">
                    <InputField
                      id="fat-percentage"
                      label=""
                      ariaLabel="Pourcentage de lipides"
                      type="number"
                      suffix="%"
                      value={fatPercentage}
                      onChange={(event) => {
                        const value = event.target.value
                        setFatPercentage(value)
                        setCustomFatPercentage(value)
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {macroMode === 'custom' && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">
                  Total
                </span>

                <span className="font-semibold text-[var(--color-text)]">
                  {Number(proteinPercentage) +
                    Number(carbsPercentage) +
                    Number(fatPercentage)}
                  %
                </span>
              </div>
            )}
          </section>

          {/* Fiber goal */}
          <section
            className="
                            mt-5
                            rounded-2xl
                            border
                            border-[var(--color-border)]
                            bg-sky-50
                            p-4
                        "
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">
                Objectif fibres
              </h2>

              <Info
                className="h-4 w-4 text-[var(--color-primary)]"
                aria-hidden="true"
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--color-fiber)]" />
                <span>Fibres</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-24">
                  <InputField
                    id="fiber-grams"
                    label=""
                    ariaLabel="Objectif de fibres quotidien"
                    type="number"
                    value={fiberGrams}
                    onChange={(event) => setFiberGrams(event.target.value)}
                  />
                </div>

                <span className="text-sm text-[var(--color-text-muted)]">
                  g / jour
                </span>
              </div>
            </div>
          </section>

          {/* Feedback messages */}
          {error && (
            <div className="my-4">
              <FeedbackMessage type="error">
                {error}
              </FeedbackMessage>
            </div>
          )}

          {success && (
            <div className="my-4">
              <FeedbackMessage type="success">
                {success}
              </FeedbackMessage>
            </div>
          )}

          <div className="my-4">
            <Button type="submit">
              Enregistrer mes objectifs
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default NutritionGoalsForm
