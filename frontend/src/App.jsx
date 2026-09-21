import AuthForm from "./components/auth/AuthForm";
import { useEffect, useState } from 'react'

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

  if (isLoading) {
    return <p>Chargement...</p>
  }

  return user ? (
    <p>Connecté en tant que {user.email}</p>
  ) : (
    <AuthForm />
  )
}

export default App
