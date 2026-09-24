import { Link } from 'react-router-dom'
import Button from '../ui/Button'

function Profile({ user, onLogout }) {
  return (
    <main className="min-h-screen bg-[var(--color-background)] px-6 pt-8 pb-24">
      <div className="mx-auto w-full max-w-sm">
        <header>
          <h1 className="text-2xl font-bold">
            Profil
          </h1>
        </header>

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
          <p className="text-sm text-[var(--color-text-muted)]">
            Adresse e-mail
          </p>

          <p className="mt-1 font-medium">
            {user.email}
          </p>
        </section>

        <div className="mt-6 space-y-3">
          <Link
            to="/goals"
            className="
              flex
              min-h-12
              items-center
              justify-center
              rounded-xl
              border
              border-[var(--color-primary)]
              px-4
              text-base
              font-semibold
              text-[var(--color-primary)]
              transition
              hover:bg-sky-50
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--color-primary)]
              focus-visible:ring-offset-2
            "
          >
            Modifier mes objectifs nutritionnels
          </Link>

          <Button type="button" onClick={onLogout}>
            Se déconnecter
          </Button>
        </div>
      </div>

    </main>
  )
}

export default Profile
