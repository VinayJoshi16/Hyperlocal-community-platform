import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Menu, MapPin, ChevronDown, User, LogOut } from 'lucide-react'

import { selectUser, logout } from '../../redux/slices/AuthSlice'
import { selectActiveLocation, selectMyLocations,
         setActiveLocation } from '../../redux/slices/locationSlice'
import { toggleSidebar } from '../../redux/slices/uiSlice'

export default function Navbar() {
  const dispatch       = useDispatch()
  const navigate       = useNavigate()
  const user           = useSelector(selectUser)
  const activeLocation = useSelector(selectActiveLocation)
  const myLocations    = useSelector(selectMyLocations)

  const [userMenuOpen, setUserMenuOpen]         = useState(false)
  const [locationMenuOpen, setLocationMenuOpen] = useState(false)

  const userMenuRef = useRef(null)
  const locationMenuRef = useRef(null)

  // Compute initials for the user profile badge
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U'

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
      if (locationMenuRef.current && !locationMenuRef.current.contains(event.target)) {
        setLocationMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-stone-200">
      <div className="max-w-app mx-auto px-4 h-14 flex items-center gap-3">

        {/* Hamburger - mobile only */}
        <button className="btn-ghost lg:hidden" onClick={() => dispatch(toggleSidebar())}>
          <Menu size={20} />
        </button>

        {/* Logo */}
        <Link to="/feed" className="flex items-center gap-2 font-semibold">
          <div className="w-7 h-7 rounded-lg bg-primary-600 text-white text-xs font-bold
                          flex items-center justify-center">NH</div>
          <span className="hidden sm:block">NeighbourHub</span>
        </Link>

        <div className="flex-1" />

        {/* Location switcher dropdown */}
        {activeLocation && (
          <div className="relative" ref={locationMenuRef}>
            <button 
              onClick={() => setLocationMenuOpen(!locationMenuOpen)}
              className="flex items-center gap-1.5 text-sm text-stone-600 hover:bg-stone-100 px-3 py-1.5 rounded-lg"
            >
              <MapPin size={14} className="text-primary-500" />
              <span className="max-w-[140px] truncate font-medium">{activeLocation.name}</span>
              <ChevronDown size={14} className="text-stone-400" />
            </button>
            {locationMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white border border-stone-200 rounded-lg shadow-lg py-1 z-30">
                <div className="px-3 py-1 text-xs font-semibold text-stone-400 border-b border-stone-100 mb-1">
                  My Neighborhoods
                </div>
                {(myLocations || []).map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      dispatch(setActiveLocation(loc))
                      setLocationMenuOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-stone-50 flex items-center gap-2 ${
                      loc.id === activeLocation.id ? 'text-primary-600 font-semibold' : 'text-stone-600'
                    }`}
                  >
                    <MapPin size={14} />
                    <span className="truncate">{loc.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User avatar + dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 hover:bg-stone-100 rounded-lg px-2 py-1.5"
          >
            <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
            <ChevronDown size={14} className="text-stone-400" />
          </button>
          
          {userMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-stone-200 rounded-lg shadow-lg py-1 z-30">
              <div className="px-3 py-1.5 text-xs text-stone-500 border-b border-stone-100 mb-1">
                Signed in as <span className="font-semibold text-stone-700 block truncate">{user?.email}</span>
              </div>
              <Link
                to="/profile"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50"
              >
                <User size={14} />
                My Profile
              </Link>
              <button
                onClick={() => {
                  setUserMenuOpen(false)
                  dispatch(logout())
                  navigate('/login')
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}