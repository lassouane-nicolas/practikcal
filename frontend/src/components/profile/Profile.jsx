function Profile({ user, onLogout }) {
  return (
    <main>
      <h1>Profil</h1>

      <p>{user.email}</p>

      <button type="button" onClick={onLogout}>
        Se déconnecter
      </button>
    </main>
  )
}

export default Profile
