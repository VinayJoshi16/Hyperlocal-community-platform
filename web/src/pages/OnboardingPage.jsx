// Shown once after first signup - two ways to set location:
// 1. GPS (browser geolocation - free, no API key needed)
// 2. Manual search by name

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { MapPin, Navigation, Search, ArrowRight, Loader, CheckCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

import {
  setLocationFromGPS,
  searchLocations,
  joinLocation,
  selectSearchResults,
  selectIsSearching,
  selectSettingLocation
} from '../redux/slices/locationSlice'

export default function OnboardingPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const searchResults = useSelector(selectSearchResults)
  const isSearching = useSelector(selectIsSearching)
  const isSettingLocation = useSelector(selectSettingLocation)

  const [gpsError, setGpsError]       = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [step, setStep]               = useState('choose') // 'choose' | 'search' | 'done'

  // GPS flow
  function handleUseGPS() {
    if (isSettingLocation) return
    setGpsError('')
    
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.')
      setStep('search')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const result = await dispatch(
            setLocationFromGPS({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          )
          if (result.meta.requestStatus === 'fulfilled') {
            setStep('done')
            setTimeout(() => navigate('/feed'), 1500)
          } else {
            setGpsError(result.payload || 'Could not resolve neighborhood from coordinates.')
            setStep('search')
          }
        } catch (err) {
          setGpsError('Failed to configure location.')
          setStep('search')
        }
      },
      (err) => {
        setGpsError('Location permission denied. Please search manually.')
        setStep('search')
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  // Search with 400ms debounce
  useEffect(() => {
    if (searchQuery.length < 2) return
    const timer = setTimeout(() => {
      dispatch(searchLocations(searchQuery))
    }, 450)
    return () => clearTimeout(timer)
  }, [searchQuery, dispatch])

  // Join manual location
  async function handleJoinLocation(locationId) {
    try {
      const result = await dispatch(joinLocation(locationId))
      if (result.meta.requestStatus === 'fulfilled') {
        setStep('done')
        setTimeout(() => navigate('/feed'), 1500)
      }
    } catch (err) {
      toast.error('Failed to join community.')
    }
  }

  // Done state → success icon → redirect
  if (step === 'done') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="card p-8 w-full max-w-md text-center flex flex-col items-center gap-4 bg-white border border-stone-200 rounded-xl shadow-card">
          <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-3xl font-bold animate-bounce">
            <CheckCircle size={36} />
          </div>
          <h2 className="text-xl font-bold text-stone-850">Location Configured</h2>
          <p className="text-sm text-stone-400">
            Welcome! Loading your local neighborhood feed...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md bg-white border border-stone-200 shadow-card rounded-xl">
        
        {/* Step Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-lg font-bold shadow-md mx-auto mb-4">
            <MapPin size={22} />
          </div>
          <h1 className="text-2xl font-bold text-stone-800">Set your location</h1>
          <p className="text-stone-500 mt-1.5 text-sm leading-relaxed">
            {step === 'choose'
              ? 'To connect with your neighborhood, let us know where you are.'
              : 'Type the name of your society, block, or area.'
            }
          </p>
        </div>

        {gpsError && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 text-center font-medium">
            {gpsError}
          </div>
        )}

        {step === 'choose' ? (
          /* CHOOSE FLOW: GPS vs Manual Switch */
          <div className="space-y-4">
            <button
              onClick={handleUseGPS}
              disabled={isSettingLocation}
              className="w-full btn-primary py-3.5 flex items-center justify-center gap-2.5 font-semibold text-sm transition-all"
            >
              {isSettingLocation ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  Detecting location...
                </>
              ) : (
                <>
                  <Navigation size={16} />
                  Use Current Location (GPS)
                </>
              )}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-stone-200"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold uppercase tracking-wider text-stone-400">or</span>
              <div className="flex-grow border-t border-stone-200"></div>
            </div>

            <button
              onClick={() => setStep('search')}
              className="w-full btn-secondary py-3 flex items-center justify-center gap-2 font-semibold text-sm transition-all"
            >
              <Search size={16} />
              Search Manually
            </button>
          </div>
        ) : (
          /* SEARCH FLOW */
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => {
                  setStep('choose')
                  setSearchQuery('')
                }}
                className="text-stone-400 hover:text-stone-600 transition-colors p-1 rounded-full hover:bg-stone-50"
              >
                <ArrowLeft size={16} />
              </button>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Back to choice</span>
            </div>

            <div>
              <label htmlFor="search" className="label text-xs">
                Search Neighborhood
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Search size={16} />
                </span>
                <input
                  id="search"
                  type="text"
                  placeholder="e.g. Garden City, Royal Block"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-9 text-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* Results area */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-8 text-stone-400 gap-2">
                  <Loader className="animate-spin" size={24} />
                  <span className="text-xs font-medium">Searching directories...</span>
                </div>
              ) : searchQuery.length >= 2 && searchResults.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs font-medium">
                  No neighborhoods found. Try a different name.
                </div>
              ) : (
                searchResults.map((loc) => (
                  <div
                    key={loc.id}
                    onClick={() => handleJoinLocation(loc.id)}
                    className="p-3 border border-stone-200 hover:border-primary-400 hover:bg-primary-50/10 rounded-lg flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-stone-800 truncate">{loc.name}</p>
                      <p className="text-[10px] text-stone-400 capitalize mt-0.5 font-medium">
                        {loc.type} {loc.parent_name ? `• ${loc.parent_name}` : ''}
                      </p>
                    </div>
                    <button className="flex-shrink-0 text-primary-600 hover:text-primary-700 p-1.5 hover:bg-primary-50 rounded-full transition-all">
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}