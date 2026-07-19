import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Plus, Users, ShieldAlert, ArrowRight, MessageSquare, Lock, Globe, EyeOff, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

import { selectActiveLocation } from '../redux/slices/locationSlice'
import { selectUser } from '../redux/slices/authSlice'
import { circlesAPI } from '../services/api'

// Fallback color list for avatars
const COLORS = [
  'bg-blue-500 text-white',
  'bg-emerald-500 text-white',
  'bg-violet-500 text-white',
  'bg-amber-500 text-white',
  'bg-rose-500 text-white',
  'bg-indigo-500 text-white',
  'bg-teal-500 text-white',
]

function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % COLORS.length
  return COLORS[index]
}

export default function CirclesPage() {
  const navigate = useNavigate()
  const activeLocation = useSelector(selectActiveLocation)
  const user = useSelector(selectUser)

  const [circles, setCircles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Creation State
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [privacy, setPrivacy] = useState('public')
  const [imageUrl, setImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (activeLocation?.id) {
      fetchCircles()
    }
  }, [activeLocation?.id])

  async function fetchCircles() {
    setIsLoading(true)
    try {
      const res = await circlesAPI.getCircles()
      setCircles(res.data)
    } catch (err) {
      toast.error('Failed to load circles')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateCircle(e) {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      const res = await circlesAPI.createCircle({
        name: name.trim(),
        description: description.trim(),
        privacy,
        image_url: imageUrl.trim() || null
      })
      toast.success('Community Circle created! 🎉')
      setCircles((prev) => [res.data, ...prev])
      setIsModalOpen(false)
      setName('')
      setDescription('')
      setImageUrl('')
      setPrivacy('public')
      // Redirect to chat instantly
      navigate(`/circles/${res.data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create circle')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleJoin(circleId) {
    try {
      const res = await circlesAPI.join(circleId)
      if (res.data.status === 'joined') {
        toast.success('Joined circle! 💬')
        // Refresh list
        fetchCircles()
      } else if (res.data.status === 'requested') {
        toast.success('Join request sent to admin! ⏳')
        fetchCircles()
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to join circle')
    }
  }

  return (
    <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain w-full space-y-6 animate-fadeIn pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="space-y-1.5 text-left">
          <h2 className="text-xl font-bold text-stone-850 flex items-center gap-2">
            💬 Community Circles
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            Join local groups in <span className="font-semibold text-primary-600">{activeLocation?.name || 'your community'}</span> to collaborate, chat, and vote.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center justify-center gap-1.5 self-start sm:self-center px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={15} />
          Create Circle
        </button>
      </div>

      {/* Circle list Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-stone-200 rounded-2xl p-5 h-44 animate-pulse space-y-3" />
          ))}
        </div>
      ) : circles.length === 0 ? (
        <div className="bg-white border border-stone-200/90 rounded-2xl p-10 text-center space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <Users size={24} />
          </div>
          <h3 className="text-sm font-bold text-stone-800">No Community Circles Yet</h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Be the first one to create a Circle in your neighborhood! You can create interest groups like sports clubs, pet owners, or local associations.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary px-4 py-2 text-xs font-bold rounded-lg mt-2 inline-flex items-center gap-1"
          >
            Create First Circle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {circles.map((circle) => {
            const isMember = !!circle.my_role
            const isPending = circle.join_request_status === 'pending'
            const initials = circle.name.substring(0, 1).toUpperCase()
            const colorClass = getAvatarColor(circle.name)

            return (
              <div
                key={circle.id}
                className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.015)] hover:shadow-md transition-all duration-200 flex flex-col justify-between text-left relative"
              >
                {/* Unread badge */}
                {circle.unread_count > 0 && (
                  <span className="absolute top-4 right-4 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                    {circle.unread_count} unread
                  </span>
                )}

                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    {/* Circle avatar */}
                    {circle.image_url ? (
                      <img
                        src={circle.image_url}
                        alt={circle.name}
                        className="w-10 h-10 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${colorClass}`}>
                        {initials}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-stone-850 truncate pr-16">{circle.name}</h3>
                      {/* Privacy Badge */}
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-stone-400 uppercase mt-0.5">
                        {circle.privacy === 'public' && <Globe size={9} />}
                        {circle.privacy === 'private' && <Lock size={9} />}
                        {circle.privacy === 'invite_only' && <EyeOff size={9} />}
                        {circle.privacy}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-500 font-medium line-clamp-2 leading-relaxed min-h-[2rem]">
                    {circle.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between gap-4">
                  {/* Last message preview */}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Last Activity</p>
                    <p className="text-xs text-stone-600 truncate mt-0.5 italic">
                      {circle.last_message || 'No messages yet'}
                    </p>
                  </div>

                  {/* Actions */}
                  {isMember ? (
                    <button
                      onClick={() => navigate(`/circles/${circle.id}`)}
                      className="h-8 px-3 rounded-lg border border-primary-200 bg-primary-50 hover:bg-primary-100 text-primary-750 text-xs font-bold flex items-center gap-1 flex-shrink-0 transition-colors"
                    >
                      Chat
                      <ArrowRight size={12} />
                    </button>
                  ) : isPending ? (
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg flex-shrink-0">
                      Pending Approval
                    </span>
                  ) : circle.privacy === 'invite_only' ? (
                    <span className="text-[10px] font-bold text-stone-400 bg-stone-50 border border-stone-200 px-2.5 py-1.5 rounded-lg flex-shrink-0">
                      Invite Only
                    </span>
                  ) : (
                    <button
                      onClick={() => handleJoin(circle.id)}
                      className="h-8 px-3 rounded-lg border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-600 hover:text-stone-850 text-xs font-bold flex-shrink-0 transition-colors"
                    >
                      {circle.privacy === 'private' ? 'Request to Join' : 'Join'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200 text-left">
            <h3 className="text-base font-bold text-stone-850 mb-4 flex items-center gap-2">
              🆕 Create a Community Circle
            </h3>
            
            <form onSubmit={handleCreateCircle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">Circle Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Neighborhood Security Watch, Sports Club"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3.5 border border-stone-200 rounded-xl text-xs font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500/80 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">Description</label>
                <textarea
                  placeholder="What is this circle about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3.5 border border-stone-200 rounded-xl text-xs font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500/80 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">Avatar Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.png"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full h-10 px-3.5 border border-stone-200 rounded-xl text-xs font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500/80 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Privacy Level</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { mode: 'public', label: 'Public', desc: 'Any resident can join.' },
                    { mode: 'private', label: 'Private', desc: 'Require join approval.' },
                    { mode: 'invite_only', label: 'Invite Only', desc: 'Only admins can add.' },
                  ].map(({ mode, label, desc }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPrivacy(mode)}
                      className={`p-2.5 border rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                        privacy === mode
                          ? 'border-primary-500 bg-primary-50/20 text-primary-850'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <span className="text-xs font-bold">{label}</span>
                      <span className="text-[8px] font-medium text-stone-400 mt-0.5 leading-snug">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
