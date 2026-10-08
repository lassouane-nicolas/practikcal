import { Outlet, useLocation } from 'react-router-dom'
import BottomNavigation from '../components/ui/BottomNavigation'

function AppLayout() {
  const location = useLocation()

  const showBottomNavigation =
    location.pathname !== '/goals' &&
    location.pathname !== '/journal/add'

  return (
    <>
      <main>
        <Outlet />
      </main>

      {showBottomNavigation && <BottomNavigation />}
    </>
  )
}

export default AppLayout
