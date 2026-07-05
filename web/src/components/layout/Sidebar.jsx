import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Home, Calendar, Search, AlertTriangle,
  Briefcase, BarChart2, MapPin, Plus, Megaphone,
} from 'lucide-react'

import { selectFeedFilter, setFeedFilter, setCreatePostOpen } from '../../redux/slices/uiSlice'
import { selectMyLocations, selectActiveLocation } from '../../redux/slices/locationSlice'
import { selectUser } from '../../redux/slices/authSlice'

const POST_TYPES = [
  { type: 'all',          label: 'All posts',        icon: Home },
  { type: 'announcement', label: 'Announcements',    icon: Megaphone },
  { type: 'event',        label: 'Events',           icon: Calendar },
  { type: 'lost_found',   label: 'Lost & Found',     icon: Search },
  { type: 'business',     label: 'Local businesses', icon: Briefcase },
  { type: 'poll',         label: 'Polls',            icon: BarChart2 },
  { type: 'emergency',    label: 'Alerts',           icon: AlertTriangle },
]

export default function Sidebar() {
  const dispatch       = useDispatch()
  const navigate       = useNavigate()
  const feedFilter     = useSelector(selectFeedFilter)
  const myLocations    = useSelector(selectMyLocations)
  const activeLocation = useSelector(selectActiveLocation)
  const user           = useSelector(selectUser)

  function handleFilterClick(type) {
    dispatch(setFeedFilter(type))
    navigate('/feed')
  }

  return (
    <nav className="flex flex-col gap-6">

      {/* Create post button */}
      <button
        onClick={() => dispatch(setCreatePostOpen(true))}
        className="btn-primary w-full justify-center gap-2"
      >
        <Plus size={16} />
        New post
      </button>

      {/* Feed type filters */}
      <div>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 px-2">
          Browse
        </p>
        <ul className="flex flex-col gap-0.5">
          {POST_TYPES.map(({ type, label, icon: Icon }) => {
            const isActive = feedFilter === type
            return (
              <li key={type}>
                <button
                  onClick={() => handleFilterClick(type)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg
                              text-sm font-medium transition-colors text-left
                              ${isActive
                                ? 'bg-primary-50 text-primary-700'
                                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-800'
                              }`}
                >
                  <Icon size={16} className={isActive ? 'text-primary-600' : 'text-stone-400'} />
                  {label}
                  {type === 'emergency' && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-red-500" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="divider my-0" />

      {/* My communities */}
      {myLocations.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 px-2">
            My communities
          </p>
          <ul className="flex flex-col gap-0.5">
            {myLocations.map((loc) => {
              const isActive = activeLocation?.id === loc.id
              return (
                <li key={loc.id}>
                  <button className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg
                                      text-sm transition-colors text-left
                                      ${isActive
                                        ? 'bg-stone-100 text-stone-800 font-medium'
                                        : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                                      }`}>
                    <MapPin size={14} className={isActive ? 'text-primary-500' : 'text-stone-300'} />
                    <span className="truncate">{loc.name}</span>
                    <span className="ml-auto text-xs text-stone-300 capitalize flex-shrink-0">
                      {loc.type}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Role badge */}
      {user?.role && user.role !== 'user' && (
        <div className="mt-auto">
          <div className={`px-2.5 py-2 rounded-lg text-xs font-medium
            ${user.role === 'admin'     ? 'bg-primary-50 text-primary-700'  :
              user.role === 'business'  ? 'bg-amber-50 text-amber-700'      :
              user.role === 'moderator' ? 'bg-purple-50 text-purple-700'    : ''}`}>
            {user.role === 'admin'     && '👑 Society Admin'}
            {user.role === 'business'  && '🏪 Business Owner'}
            {user.role === 'moderator' && '🛡️ Moderator'}
          </div>
        </div>
      )}

    </nav>
  )
}