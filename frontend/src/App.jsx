import AuthForm from "./components/auth/AuthForm";
import Profile from './components/profile/Profile'
import Actions from './components/actions/Actions'
import NutritionGoalsForm from './components/goals/NutritionGoalsForm'
import AppLayout from './layouts/AppLayout'
import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

function App() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await fetch('http://localhost:3000/auth/me', {
          credentials: 'include'
        })

        if (!response.ok) {
          setUser(null)
          return
        }

        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentUser()
  }, [])

  async function handleLogout() {
    try {
      const response = await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        return
      }

      setUser(null)
    } catch (error) {
      console.error(error)
    }
  }

  if (isLoading) {
    return <p>Chargement...</p>
  }

  return (
    <Routes>
      <Route
        element={
          user
            ? <AppLayout />
            : <Navigate to="/login" replace />
        }
      >
        <Route
          path="/"
          element={<p>Connecté en tant que {user?.email}</p>}
        />

        <Route
          path="/actions"
          element={<Actions />}
        />

        <Route
          path="/goals"
          element={<NutritionGoalsForm />}
        />

        <Route
          path="/profile"
          element={<Profile user={user} onLogout={handleLogout} />}
        />
      </Route>

      <Route
        path="/login"
        element={
          user
            ? <Navigate to="/" replace />
            : <AuthForm />
        }
      />
    </Routes>
  )
}

export default App
