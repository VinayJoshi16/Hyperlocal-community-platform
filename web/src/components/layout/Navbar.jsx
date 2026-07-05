import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Menu, MapPin, ChevronDown, User, LogOut } from 'lucide-react'

import { selectUser, logout } from '../../redux/slices/authSlice'
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

  // Close dropdowns when clicking outside via refs
  // ...

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
          <button className="flex items-center gap-1.5 text-sm text-stone-600
                             hover:bg-stone-100 px-3 py-1.5 rounded-lg">
            <MapPin size={14} className="text-primary-500" />
            <span className="max-w-[140px] truncate font-medium">{activeLocation.name}</span>
            <ChevronDown size={14} className="text-stone-400" />
          </button>
        )}

        {/* User avatar + dropdown */}
        <div className="relative">
          <button className="flex items-center gap-2 hover:bg-stone-100 rounded-lg px-2 py-1.5">
            <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700
                            flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
          </button>
          {/* Dropdown: Profile link, Sign out */}
        </div>

      </div>
    </header>
  )
}