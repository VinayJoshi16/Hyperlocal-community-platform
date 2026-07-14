import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Menu, MapPin, ChevronDown, User, LogOut, Plus, Search, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'

import { selectUser, logout } from '../../redux/slices/authSlice'
import { selectActiveLocation, selectMyLocations,
         setActiveLocation, searchLocations, setLocationFromGPS,
         updateUserPrimaryLocation, selectSearchResults,
         selectIsSearching, selectSettingLocation } from '../../redux/slices/locationSlice'
import { toggleSidebar } from '../../redux/slices/uiSlice'

export default function Navbar() {
  const dispatch       = useDispatch()
  const navigate       = useNavigate()
  const user           = useSelector(selectUser)
  const activeLocation = useSelector(selectActiveLocation)
  const myLocations    = useSelector(selectMyLocations)

  const [userMenuOpen, setUserMenuOpen]         = useState(false)
  const [locationMenuOpen, setLocationMenuOpen] = useState(false)
  const [changeLocationModalOpen, setChangeLocationModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const searchResults = useSelector(selectSearchResults)
  const isSearching = useSelector(selectIsSearching)
  const isSettingLocation = useSelector(selectSettingLocation)

  const userMenuRef = useRef(null)

  // Debounced search for locations picker
  useEffect(() => {
    if (searchQuery.length < 2) return
    const timer = setTimeout(() => {
      dispatch(searchLocations(searchQuery))
    }, 450)
    return () => clearTimeout(timer)
  }, [searchQuery, dispatch])
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
    <header className="sticky top-0 z-20 bg-white border-b border-stone-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="max-w-app mx-auto px-6 lg:px-10 h-16 flex items-center gap-3">

        {/* Hamburger - mobile only */}
        <button className="btn-ghost lg:hidden" onClick={() => dispatch(toggleSidebar())}>
          <Menu size={20} />
        </button>

        {/* Logo */}
        <Link id="tour-logo" to="/feed" className="flex items-center gap-2 font-semibold">
          <div className="w-7 h-7 rounded-lg bg-primary-600 text-white text-xs font-bold
                          flex items-center justify-center">NH</div>
          <span className="hidden sm:block">NeighbourHub</span>
        </Link>

        <div className="flex-1" />

        {/* Location switcher dropdown */}
        {activeLocation && (
          <div className="relative" ref={locationMenuRef}>
            <button 
              id="tour-location"
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
                
                <div className="px-3 py-2 border-t border-stone-100 mt-1 select-none">
                  <button
                    onClick={() => {
                      setLocationMenuOpen(false)
                      setChangeLocationModalOpen(true)
                    }}
                    className="w-full text-center px-3 py-1.8 text-[11px] font-bold text-primary-600 bg-primary-50/50 hover:bg-primary-50 active:bg-primary-100/80 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus size={12} className="stroke-[2.5]" /> Change Location
                  </button>
                </div>
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
                  navigate('/')
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

      {/* Change Location Modal */}
      {changeLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white rounded-2xl border border-stone-200 w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200 text-left"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-extrabold text-stone-850 flex items-center gap-1.5">
                <MapPin size={17} className="text-primary-600" />
                Change Current Location
              </h3>
              <button 
                onClick={() => {
                  setChangeLocationModalOpen(false)
                  setSearchQuery('')
                }}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* GPS Button */}
            <button
              onClick={() => {
                if (isSettingLocation) return
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                      try {
                        const result = await dispatch(
                          setLocationFromGPS({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                        )
                        if (result.meta.requestStatus === 'fulfilled') {
                          setChangeLocationModalOpen(false)
                          setSearchQuery('')
                          // reload feed to fetch new location content
                          navigate('/feed')
                          window.location.reload()
                        }
                      } catch (_) {
                        toast.error('Failed to sync location with GPS.')
                      }
                    },
                    (err) => {
                      toast.error('GPS permission denied. Please search manually.')
                    },
                    { enableHighAccuracy: true, timeout: 8000 }
                  )
                } else {
                  toast.error('Geolocation is not supported by your browser.')
                }
              }}
              disabled={isSettingLocation}
              className="w-full h-11 bg-primary-50 hover:bg-primary-100/80 active:bg-primary-100 text-primary-700 border border-primary-200/60 font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 mb-5"
            >
              {isSettingLocation ? (
                <>
                  <Loader2 className="animate-spin text-primary-600" size={15} />
                  <span>Locating via GPS...</span>
                </>
              ) : (
                <>
                  <MapPin size={15} className="stroke-[2.5]" />
                  <span>Use Current GPS Location</span>
                </>
              )}
            </button>

            {/* Separator */}
            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-stone-200"></div>
              <span className="flex-shrink mx-4 text-[10px] text-stone-450 font-bold uppercase tracking-widest">Or search manually</span>
              <div className="flex-grow border-t border-stone-200"></div>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search for your new society/neighborhood..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500/80 focus:border-transparent transition-all"
              />
              <Search className="absolute left-3.5 top-3.5 text-stone-400" size={15} />
            </div>

            {/* Search Results */}
            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
              {isSearching ? (
                <div className="flex items-center justify-center py-6 text-stone-400 gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  <span className="text-xs font-semibold">Searching societies...</span>
                </div>
              ) : searchQuery.length >= 2 && searchResults.length === 0 ? (
                <div className="text-center py-6 text-xs font-semibold text-stone-400">
                  No societies found matching your search.
                </div>
              ) : searchQuery.length < 2 ? (
                <div className="text-center py-4 text-[11px] font-semibold text-stone-400/85">
                  Type at least 2 characters to search the community directory.
                </div>
              ) : (
                searchResults.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={async () => {
                      try {
                        const result = await dispatch(updateUserPrimaryLocation(loc.id))
                        if (result.meta.requestStatus === 'fulfilled') {
                          setChangeLocationModalOpen(false)
                          setSearchQuery('')
                          // reload feed to fetch new location content
                          navigate('/feed')
                          window.location.reload()
                        }
                      } catch (_) {
                        toast.error('Failed to update location.')
                      }
                    }}
                    className="w-full text-left p-3 border border-stone-150 hover:border-primary-350 bg-stone-50/40 hover:bg-primary-50/10 rounded-xl transition-all flex flex-col gap-0.5"
                  >
                    <span className="text-xs font-bold text-stone-750">{loc.name}</span>
                    <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                      {loc.type}
                    </span>
                  </button>
                ))
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  )
}