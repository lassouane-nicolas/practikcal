import { Link } from 'react-router-dom'

function Profile({ user, onLogout }) {
  return (
    <main>
      <h1>Profil</h1>

      <p>{user.email}</p>

      <Link to="/goals">
        Modifier mes objectifs nutritionnels
      </Link>

      <button type="button" onClick={onLogout}>
        Se déconnecter
      </button>
    </main>
  )
}

export default Profile
