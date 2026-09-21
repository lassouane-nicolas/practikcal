import { useEffect, useState } from 'react'

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
            } catch (error) {
                setError('Impossible de joindre le serveur.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchCurrentGoal()
    }, [])

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
        return <p>Chargement...</p>
    }

    return (
        <main>
            <h1>Objectifs nutritionnels</h1>
            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}

            <form onSubmit={handleSubmit}>
                <section>
                    <h2>Objectif énergétique</h2>

                    <label>
                        Calories par jour
                        <input
                            type="number"
                            value={dailyCalories}
                            onChange={(event) => setDailyCalories(event.target.value)}
                        />
                    </label>
                </section>

                <section>
                    <h2>Répartition des macronutriments</h2>

                    <label>
                        Protéines
                        <input
                            type="number"
                            value={proteinPercentage}
                            onChange={(event) => setProteinPercentage(event.target.value)}
                        />
                        %
                    </label>

                    <label>
                        Glucides
                        <input
                            type="number"
                            value={carbsPercentage}
                            onChange={(event) => setCarbsPercentage(event.target.value)}
                        />
                        %
                    </label>

                    <label>
                        Lipides
                        <input
                            type="number"
                            value={fatPercentage}
                            onChange={(event) => setFatPercentage(event.target.value)}
                        />
                        %
                    </label>

                    <p>
                        Total :{' '}
                        {Number(proteinPercentage) +
                            Number(carbsPercentage) +
                            Number(fatPercentage)}
                        %
                    </p>
                </section>

                <section>
                    <h2>Objectif fibres</h2>

                    <label>
                        Fibres par jour
                        <input
                            type="number"
                            value={fiberGrams}
                            onChange={(event) => setFiberGrams(event.target.value)}
                        />
                        g
                    </label>
                </section>

                <button type="submit">
                    Enregistrer mes objectifs
                </button>
            </form>
        </main>
    )
}

export default NutritionGoalsForm
