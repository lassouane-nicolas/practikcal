import { Link } from 'react-router-dom'

function Actions() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] px-6 pt-8 pb-24">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-bold">
          Actions
        </h1>

        <Link
          to="/journal/add"
          className="
            mt-6
            block
            rounded-xl
            bg-[var(--color-primary)]
            px-4
            py-3
            text-center
            font-semibold
          "
        >
          Ajouter une entrée
        </Link>
      </div>
    </main>
  )
}

export default Actions
