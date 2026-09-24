import { BookOpen, CirclePlus, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const getNavItemClass = ({ isActive }) => `
  mx-2
  flex
  min-h-14
  flex-col
  items-center
  justify-center
  gap-1
  rounded-xl
  text-xs
  transition
  ${isActive
    ? `
        border
        border-[var(--color-primary)]
        bg-sky-50
        font-semibold
        text-[var(--color-primary)]
      `
    : 'text-[var(--color-text-muted)]'
  }
`

function BottomNavigation() {
  return (
    <nav
      aria-label="Navigation principale"
      className="
        fixed
        bottom-0
        left-0
        right-0
        border-t
        border-[var(--color-border)]
        bg-[var(--color-background)]
        px-4
        py-2
      "
    >
      <div className="mx-auto grid max-w-sm grid-cols-3">
        <NavLink
          to="/"
          className={getNavItemClass}
        >
          <BookOpen className="h-5 w-5" aria-hidden="true" />
          <span>Journal</span>
        </NavLink>

        <NavLink
          to="/actions"
          className={getNavItemClass}
        >
          <CirclePlus className="h-5 w-5" aria-hidden="true" />
          <span>Actions</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={getNavItemClass}
        >
          <User className="h-5 w-5" aria-hidden="true" />
          <span>Profil</span>
        </NavLink>
      </div>
    </nav>
  )
}

export default BottomNavigation
