// Profile page - works in two modes:
// /profile       → own profile (editable name, logout button, stats)
// /profile/:userId → another user's profile (read-only)

export default function ProfilePage() {
  const { userId }   = useParams()
  const isOwnProfile = !userId || userId === currentUser?.id

  // Inline name editing - click pencil → input appears with save/cancel
  const [editing, setEditing] = useState(false)
  const [name, setName]       = useState(currentUser?.name || '')

  async function handleSaveProfile() {
    const result = await dispatch(updateProfile({ name: name.trim() }))
    if (result.meta.requestStatus === 'fulfilled') setEditing(false)
  }

  return (
    <div className="max-w-feed mx-auto w-full">
      {/* Profile card: avatar, name (editable), role badge, stats */}
      {/* Posts grid below using the same PostCard component */}
    </div>
  )
}