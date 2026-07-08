// Profile page - works in two modes:
// /profile       → own profile (editable name, logout button, stats)
// /profile/:userId → another user's profile (read-only)

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  User, Mail, Edit2, Check, X, LogOut, 
  MapPin, Loader2, BookOpen, ShieldCheck 
} from 'lucide-react'
import toast from 'react-hot-toast'

import { selectUser, updateProfile, logout } from '../redux/slices/authSlice'
import { selectMyLocations } from '../redux/slices/locationSlice'
import { postsAPI } from '../services/api'
import PostCard from '../components/feed/PostCard'
import PostSkeleton from '../components/feed/PostSkeleton'

export default function ProfilePage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const currentUser = useSelector(selectUser)
  const myLocations = useSelector(selectMyLocations)

  const isOwnProfile = !userId || userId === currentUser?.id
  const targetUserId = isOwnProfile ? currentUser?.id : userId

  const [posts, setPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Sync edit name state with user name
  useEffect(() => {
    if (currentUser?.name) {
      setEditName(currentUser.name)
    }
  }, [currentUser])

  // Fetch target user's posts
  useEffect(() => {
    if (!targetUserId) return
    setLoadingPosts(true)
    postsAPI.getUserPosts(targetUserId)
      .then((res) => {
        setPosts(res.data.data.posts || [])
      })
      .catch(() => {
        toast.error('Failed to load posts.')
      })
      .finally(() => {
        setLoadingPosts(false)
      })
  }, [targetUserId])

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[350px]">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </div>
    )
  }

  // Derive other user profile details from their posts
  const otherUser = !isOwnProfile && posts.length > 0 ? {
    name: posts[0].author_name,
    avatar: posts[0].author_avatar,
    role: posts[0].author_role
  } : null

  const displayName = isOwnProfile 
    ? currentUser.name 
    : (otherUser?.name || 'Neighborhood Resident')

  const displayRole = isOwnProfile 
    ? currentUser.role 
    : (otherUser?.role || 'user')

  const displayAvatar = isOwnProfile
    ? currentUser.avatar_url
    : otherUser?.avatar

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty.')
      return
    }
    if (editName.trim() === currentUser.name) {
      setEditing(false)
      return
    }

    setIsSaving(true)
    try {
      const result = await dispatch(updateProfile({ name: editName.trim() }))
      if (result.meta.requestStatus === 'fulfilled') {
        setEditing(false)
      }
    } catch (err) {
      toast.error('Failed to update name.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <div className="max-w-feed mx-auto w-full px-4 py-8 space-y-6">
      
      {/* Profile Card Header */}
      <div className="card p-6 bg-white border border-stone-200 rounded-xl shadow-card relative">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          
          {/* Avatar Area */}
          {displayAvatar ? (
            <img 
              src={displayAvatar} 
              alt={displayName} 
              className="w-20 h-20 rounded-full object-cover border border-stone-250 flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold border border-primary-200 flex-shrink-0 select-none">
              {initials}
            </div>
          )}

          {/* Profile details */}
          <div className="flex-1 text-center sm:text-left min-w-0 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              {editing ? (
                <div className="flex items-center gap-1.5 w-full max-w-xs justify-center sm:justify-start">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input py-1 text-base font-bold text-stone-800"
                    disabled={isSaving}
                    maxLength={60}
                    autoFocus
                  />
                  <button 
                    onClick={handleSaveProfile}
                    className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-green-200 flex-shrink-0"
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  </button>
                  <button 
                    onClick={() => {
                      setEditing(false)
                      setEditName(currentUser.name || '')
                    }}
                    className="p-1.5 bg-stone-50 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200 flex-shrink-0"
                    disabled={isSaving}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-2 max-w-full">
                  <h1 className="text-xl font-bold text-stone-850 truncate">{displayName}</h1>
                  {isOwnProfile && (
                    <button 
                      onClick={() => setEditing(true)}
                      className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-50 transition-colors flex-shrink-0"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
              )}

              {/* Role badge */}
              <span className={`w-max mx-auto sm:mx-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                displayRole === 'admin' 
                  ? 'bg-red-100 text-red-800 border border-red-200' 
                  : displayRole === 'moderator'
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : displayRole === 'business'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-stone-100 text-stone-700 border border-stone-200'
              }`}>
                {displayRole === 'user' ? 'Resident' : displayRole}
              </span>
            </div>

            {/* Email (only shown if viewing own profile) */}
            {isOwnProfile && (
              <p className="text-xs text-stone-400 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                <Mail size={13} />
                {currentUser.email}
              </p>
            )}
          </div>

          {/* Sign Out CTA (Own Profile only) */}
          {isOwnProfile && (
            <button
              onClick={handleSignOut}
              className="btn-secondary px-3.5 py-2 text-red-600 hover:bg-red-50 hover:border-red-200 text-xs font-semibold gap-1.5 sm:self-center transition-all flex items-center"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Post Stats */}
        <div className="card p-5 bg-white border border-stone-200 rounded-xl shadow-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Posts Authored</h4>
            <p className="text-xl font-bold text-stone-800 mt-0.5">{posts.length}</p>
          </div>
        </div>

        {/* Neighborhood Joined (Own Profile only) */}
        {isOwnProfile && (
          <div className="card p-5 bg-white border border-stone-200 rounded-xl shadow-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Neighborhoods</h4>
              <p className="text-sm font-semibold text-stone-700 mt-1 truncate">
                {myLocations.map(l => l.name).join(', ') || 'None joined yet'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* User Posts list */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck size={16} />
          {isOwnProfile ? 'My Published Posts' : `Posts by ${displayName}`}
        </h3>

        {loadingPosts ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : posts.length === 0 ? (
          <div className="card py-12 text-center text-stone-400 text-sm font-medium bg-white border border-stone-200 rounded-xl">
            No posts shared yet.
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}