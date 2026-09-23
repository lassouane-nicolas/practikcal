import { useState } from 'react'
import InputField from '../ui/InputField'
import Button from '../ui/Button'

function AuthForm() {
    const [mode, setMode] = useState('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

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
        <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-semibold text-gray-900">
                    {isLogin ? 'Connexion' : 'Créer un compte'}
                </h1>

                <p className="mt-2 text-sm text-gray-600">
                    {isLogin
                        ? 'Connectez-vous à votre compte PractiKcal.'
                        : 'Créez votre compte pour commencer votre suivi.'}
                </p>

                <form
                    className="mt-6 space-y-4"
                    onSubmit={handleSubmit}
                >
                    <InputField
                        id="email"
                        label="E-mail"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />

                    <InputField
                        id="password"
                        label="Mot de passe"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />

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


                <button
                    type="button"
                    className="mt-6 text-sm font-medium text-gray-700 underline"
                    onClick={() => setMode(isLogin ? 'register' : 'login')}
                >
                    {isLogin
                        ? 'Créer un compte'
                        : 'J’ai déjà un compte'}
                </button>
            </section>
        </main>
    )
}

export default AuthForm
