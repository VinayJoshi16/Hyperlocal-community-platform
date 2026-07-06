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
  { type: 'emergency',    label: 'Emergency',        icon: AlertTriangle },
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
        className="btn-primary w-full py-3.5 px-4 justify-center gap-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ease-out"
      >
        <Plus size={16} className="stroke-[2.5]" />
        New Post
      </button>

      {/* Feed type filters */}
      <div>
        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 px-2">
          Browse
        </p>
        <ul className="flex flex-col gap-1">
          {POST_TYPES.map(({ type, label, icon: Icon }) => {
            const isActive = feedFilter === type
            return (
              <li key={type}>
                <button
                  onClick={() => handleFilterClick(type)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                              text-sm font-semibold transition-all duration-150 text-left
                              ${isActive
                                ? 'bg-primary-50 text-primary-700 font-bold'
                                : 'text-stone-600 hover:bg-stone-100/70 hover:text-stone-850'
                              }`}
                >
                  <Icon size={17} className={isActive ? 'text-primary-600' : 'text-stone-400'} />
                  {label}
                  {type === 'emergency' && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse" />
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
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 px-2">
            My Communities
          </p>
          <ul className="flex flex-col gap-1">
            {myLocations.map((loc) => {
              const isActive = activeLocation?.id === loc.id
              return (
                <li key={loc.id}>
                  <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                      text-sm transition-all duration-150 text-left
                                      ${isActive
                                        ? 'bg-stone-100 text-stone-800 font-bold'
                                        : 'text-stone-550 hover:bg-stone-50 hover:text-stone-750'
                                      }`}>
                    <MapPin size={15} className={isActive ? 'text-primary-500' : 'text-stone-350'} />
                    <span className="truncate">{loc.name}</span>
                    <span className="ml-auto text-[9px] font-bold tracking-wide text-stone-400 uppercase flex-shrink-0">
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