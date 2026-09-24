import { useState } from 'react'
import InputField from '../ui/InputField'
import Button from '../ui/Button'
import logo from '../../assets/practikcal-logo.png'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

function AuthForm({ onLoginSuccess }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const isLogin = mode === 'login'

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.')
      return
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    const endpoint = isLogin
      ? 'http://localhost:3000/auth/login'
      : 'http://localhost:3000/auth/register'

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setError('Un compte existe déjà avec cette adresse e-mail.')
        } else if (response.status === 401) {
          setError('Email ou mot de passe incorrect.')
        } else {
          setError('Une erreur est survenue. Veuillez réessayer.')
        }

        return
      }

      if (isLogin) {
        setSuccess('Connexion réussie.')

        await onLoginSuccess()
      } else {
        setMode('login')
        setPassword('')
        setSuccess('Compte créé avec succès. Vous pouvez maintenant vous connecter.')
      }
    } catch (error) {
      setError('Impossible de contacter le serveur. Veuillez réessayer.')
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-6">
      <section className="mx-auto w-full max-w-sm pt-24">
        <div className="text-center">
          <img
            src={logo}
            alt="Logo PractiKcal"
            className="mx-auto mb-2 h-28 w-28 object-contain"
          />
          <h1 className="text-3xl font-bold">
            Practi<span className="text-[var(--color-primary)]">Kcal</span>
          </h1>

          <p className="mt-4 text-xl font-semibold">
            {isLogin ? 'Se connecter' : 'Créer un compte'}
          </p>
        </div>

        <form
          className="mt-8 space-y-5"
          onSubmit={handleSubmit}
        >
          <InputField
            id="email"
            label="E-mail"
            type="email"
            icon={Mail}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <div className="space-y-1">
            <div className="relative">
              <InputField
                id="password"
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                className="
                                  absolute
                                  right-4
                                  top-[42px]
                                  text-[var(--color-text-muted)]
                                "
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm font-medium text-[var(--color-primary)]"

                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}
          </div>

          {error && (
            <p
              className="text-sm text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              className="text-sm text-green-600"
              role="status"
            >
              {success}
            </p>
          )}

          <Button type="submit">
            {isLogin ? 'Se connecter' : 'Créer mon compte'}
          </Button>
        </form>


        <div className="mt-8 text-center">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--color-border)]" />

            <p className="text-sm text-[var(--color-text-muted)]">
              {isLogin
                ? 'Pas encore de compte ?'
                : 'Déjà un compte ?'}
            </p>

            <div className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          <button
            type="button"
            className="mt-2 text-base font-medium text-[var(--color-primary)]"
            onClick={() => setMode(isLogin ? 'register' : 'login')}
          >
            {isLogin
              ? 'Créer un compte'
              : 'Se connecter'}
          </button>
        </div>
      </section>
    </main>
  )
}

export default AuthForm
