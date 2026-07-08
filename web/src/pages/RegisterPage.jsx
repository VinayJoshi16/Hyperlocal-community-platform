import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  MapPin, Navigation, Search, ArrowRight, Loader, 
  CheckCircle, ArrowLeft, User, Mail, Lock, ShieldCheck, ChevronRight 
} from 'lucide-react'
import toast from 'react-hot-toast'

import {
  setLocationFromGPS,
  searchLocations,
  selectSearchResults,
  selectIsSearching,
  selectSettingLocation
} from '../redux/slices/locationSlice'
import { registerUser, verifyRegistration } from '../redux/slices/authSlice'

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Location Selector selectors
  const searchResults = useSelector(selectSearchResults)
  const isSearching = useSelector(selectIsSearching)
  const isSettingLocation = useSelector(selectSettingLocation)

  // Registration state
  const [step, setStep] = useState('location') // 'location' | 'details' | 'otp'
  const [selectedLocation, setSelectedLocation] = useState(null)
  
  const [gpsError, setGpsError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Form Fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [registering, setRegistering] = useState(false)

  // OTP Verification
  const [otpCode, setOtpCode] = useState('')
  const [verifying, setVerifying] = useState(false)

  // Leaflet Interactive Map specific hooks & states
  const [showMap, setShowMap] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [mapLocation, setMapLocation] = useState(null)
  const [resolvingMapLoc, setResolvingMapLoc] = useState(false)
  
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const mapInstance = useRef(null)

  // Dynamic Leaflet asset loader
  useEffect(() => {
    if (!showMap || window.L) {
      if (window.L) setLeafletLoaded(true)
      return
    }

    // Load Leaflet CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    // Load Leaflet JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.onload = () => {
      setLeafletLoaded(true)
    }
    document.head.appendChild(script)

    return () => {
      // Keep loaded assets to avoid re-fetching on toggle
    }
  }, [showMap])

  const resolveCoordinates = async (lat, lng) => {
    setResolvingMapLoc(true)
    setGpsError('')
    try {
      const result = await dispatch(setLocationFromGPS({ lat, lng }))
      if (result.meta.requestStatus === 'fulfilled' && result.payload.length > 0) {
        const primaryLoc = result.payload.find(l => l.is_primary) || result.payload[0]
        setMapLocation(primaryLoc)
      } else {
        setMapLocation(null)
      }
    } catch (err) {
      setMapLocation(null)
    } finally {
      setResolvingMapLoc(false)
    }
  }

  // Leaflet Map Search states & handler
  const [mapSearchQuery, setMapSearchQuery] = useState('')
  const [isMapSearching, setIsMapSearching] = useState(false)

  const handleMapSearch = async () => {
    if (!mapSearchQuery.trim()) return
    setIsMapSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery.trim())}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        }
      )
      const data = await response.json()
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        const latNum = parseFloat(lat)
        const lngNum = parseFloat(lon)

        if (mapInstance.current && markerRef.current) {
          mapInstance.current.setView([latNum, lngNum], 14)
          markerRef.current.setLatLng([latNum, lngNum])
          resolveCoordinates(latNum, lngNum)
        }
      } else {
        toast.error('Location not found. Try searching for a different city or area.')
      }
    } catch (err) {
      toast.error('Failed to search location.')
    } finally {
      setIsMapSearching(false)
    }
  }

  // Initialize Leaflet map instance
  useEffect(() => {
    if (!leafletLoaded || !showMap || !mapRef.current || mapInstance.current) return

    // Default center at Mumbai, India
    const defaultCenter = [19.0596, 72.8295] 
    
    // Create Leaflet map
    const map = window.L.map(mapRef.current).setView(defaultCenter, 12)
    mapInstance.current = map

    // Add OpenStreetMap tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    // Add draggable marker
    const marker = window.L.marker(defaultCenter, { draggable: true }).addTo(map)
    markerRef.current = marker

    // Handle marker moves
    const onMarkerMove = async () => {
      const position = marker.getLatLng()
      resolveCoordinates(position.lat, position.lng)
    }
    marker.on('dragend', onMarkerMove)

    // Handle clicking map to set marker location
    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      marker.setLatLng([lat, lng])
      resolveCoordinates(lat, lng)
    })

    // Run initial geocoding for center point
    resolveCoordinates(defaultCenter[0], defaultCenter[1])

    // Fix map rendering issues inside dynamic tabs/accordions
    setTimeout(() => {
      map.invalidateSize()
    }, 150)

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [leafletLoaded, showMap])

  // Geolocation handling
  function handleUseGPS() {
    if (isSettingLocation) return
    setGpsError('')
    
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const result = await dispatch(
            setLocationFromGPS({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          )
          if (result.meta.requestStatus === 'fulfilled' && result.payload.length > 0) {
            // First item in hierarchy is primary neighborhood
            const primaryLoc = result.payload.find(l => l.is_primary) || result.payload[0]
            setSelectedLocation(primaryLoc)
            setStep('details')
          } else {
            setGpsError(result.payload || 'Could not resolve neighborhood from coordinates.')
          }
        } catch (err) {
          setGpsError('Failed to configure location.')
        }
      },
      (err) => {
        setGpsError('Location permission denied. Please search manually.')
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  // Debounced directory search
  useEffect(() => {
    if (searchQuery.length < 2) return
    const timer = setTimeout(() => {
      dispatch(searchLocations(searchQuery))
    }, 450)
    return () => clearTimeout(timer)
  }, [searchQuery, dispatch])

  // Registration Submission
  async function handleRegisterSubmit(e) {
    e.preventDefault()
    if (!selectedLocation) {
      toast.error('Please choose a location first.')
      setStep('location')
      return
    }
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill all required fields.')
      return
    }

    setRegistering(true)
    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        locationId: selectedLocation.id
      }
      const result = await dispatch(registerUser(payload))
      if (result.meta.requestStatus === 'fulfilled') {
        setStep('otp')
      }
    } catch (err) {
      toast.error('Registration failed.')
    } finally {
      setRegistering(false)
    }
  }

  // OTP Verification Submission
  async function handleOtpSubmit(e) {
    e.preventDefault()
    if (otpCode.length !== 6) {
      toast.error('Enter 6-digit verification code.')
      return
    }

    setVerifying(true)
    try {
      const result = await dispatch(verifyRegistration({ 
        email: email.trim().toLowerCase(), 
        code: otpCode.trim() 
      }))
      if (result.meta.requestStatus === 'fulfilled') {
        navigate('/feed')
      }
    } catch (err) {
      toast.error('Email verification failed.')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-755 flex items-center justify-center px-4 font-sans">
      <div className="card p-8 w-full max-w-sm bg-white border border-stone-200 shadow-card rounded-xl relative">
        
        {/* Navbar-style header inside card */}
        <div className="text-center mb-6 select-none">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm mx-auto mb-2.5">
            N
          </div>
          <span className="text-xs font-bold tracking-tight text-stone-400">
            Neighbour<span className="text-primary-600">Hub</span> Registration
          </span>
        </div>

        {/* ─── STEP 1: LOCATION ─── */}
        {step === 'location' && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-lg font-bold text-stone-850">Find Your Neighborhood</h2>
              <p className="text-xs text-stone-400 mt-1">To connect you with local posts, let us know where you are.</p>
            </div>

            {gpsError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 text-center font-semibold leading-relaxed animate-shake">
                {gpsError}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleUseGPS}
                disabled={isSettingLocation}
                className="w-full btn-primary py-2.5 text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
              >
                {isSettingLocation ? (
                  <>
                    <Loader className="animate-spin" size={13} />
                    Locating GPS coordinates...
                  </>
                ) : (
                  <>
                    <Navigation size={13} />
                    Use Current Location (GPS)
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="w-full h-10 border border-stone-250 bg-white hover:bg-stone-50 rounded-xl text-xs font-bold text-stone-600 shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <MapPin size={13} className="text-stone-450" />
                {showMap ? 'Hide Map Selector' : 'Select on Interactive Map'}
              </button>

              {showMap && (
                <div className="space-y-3 p-3 bg-stone-50/50 border border-stone-200 rounded-xl text-left animate-in fade-in slide-in-from-top-2 duration-200">
                  <span className="block text-[9px] font-bold text-stone-450 uppercase tracking-wide leading-relaxed">
                    Search your location & drag the pin to refine
                  </span>
                  
                  {/* Map Search input */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-stone-400">
                        <Search size={12} />
                      </span>
                      <input
                        type="text"
                        placeholder="Search area (e.g. Almora)"
                        value={mapSearchQuery}
                        onChange={(e) => setMapSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleMapSearch()
                          }
                        }}
                        className="input pl-8 py-1.5 h-8 text-[11px] bg-white border-stone-200"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleMapSearch}
                      disabled={isMapSearching}
                      className="btn-primary h-8 px-3 text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm"
                    >
                      {isMapSearching ? <Loader className="animate-spin" size={11} /> : 'Search'}
                    </button>
                  </div>

                  <div 
                    ref={mapRef} 
                    className="w-full h-44 rounded-xl border border-stone-250 bg-stone-100 overflow-hidden shadow-inner z-10"
                  />
                  
                  {/* Selected Location Summary */}
                  {resolvingMapLoc ? (
                    <div className="text-[11px] text-stone-400 font-semibold flex items-center gap-1.5 py-1">
                      <Loader className="animate-spin text-stone-400" size={13} />
                      Resolving coordinates...
                    </div>
                  ) : mapLocation ? (
                    <div className="space-y-2.5">
                      <div className="p-2.5 bg-primary-50/10 border border-primary-100 rounded-xl">
                        <span className="block text-[8px] font-extrabold text-primary-500 uppercase tracking-wider">Detected Neighborhood</span>
                        <span className="text-[11px] font-extrabold text-stone-850">{mapLocation.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLocation(mapLocation)
                          setStep('details')
                        }}
                        className="w-full btn-primary py-2 text-xs font-extrabold"
                      >
                        Confirm & Continue
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-600 font-semibold py-1">
                      * Please choose a location inside mapped regions or select manually.
                    </div>
                  )}
                </div>
              )}

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-stone-150" />
                <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">or</span>
                <div className="flex-grow border-t border-stone-150" />
              </div>

              {/* Manual search input */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                  Search Manually
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Search size={13} />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Garden City, Royal Block"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-9 text-xs"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-4 text-stone-450 gap-1.5">
                    <Loader className="animate-spin" size={14} />
                    <span className="text-[10px] font-bold">Searching...</span>
                  </div>
                ) : searchQuery.length >= 2 && searchResults.length === 0 ? (
                  <div className="text-center py-4 text-stone-450 text-[10px] font-bold">
                    No results found. Try another directory name.
                  </div>
                ) : (
                  searchResults.map((loc) => (
                    <div
                      key={loc.id}
                      onClick={() => {
                        setSelectedLocation(loc)
                        setStep('details')
                      }}
                      className="p-3 border border-stone-150 bg-stone-50/40 hover:border-primary-400/50 hover:bg-stone-50 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="min-w-0 pr-2 text-left">
                        <p className="text-xs font-bold text-stone-700 truncate">{loc.name}</p>
                        <p className="text-[9px] text-stone-400 capitalize mt-0.5 font-bold">
                          {loc.type} {loc.parent_name ? `• ${loc.parent_name}` : ''}
                        </p>
                      </div>
                      <ChevronRight size={12} className="text-stone-400" />
                    </div>
                  ))
                )}
              </div>

              {/* Fallback Option if neighborhood is unmapped */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLocation({
                      id: '55555555-5555-5555-5555-555555555555',
                      name: 'Garden City Society',
                      type: 'society'
                    })
                    setStep('details')
                  }}
                  className="w-full btn-secondary py-2 text-[10px] font-bold shadow-sm flex items-center justify-center gap-1.5 border-dashed"
                >
                  <MapPin size={12} className="text-primary-500" />
                  Can't find your neighborhood? Join Sandbox
                </button>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-stone-200">
              <span className="text-xs text-stone-400 font-medium">Already have an account? </span>
              <Link to="/login" className="text-xs font-bold text-primary-600 hover:text-primary-750 transition-colors">
                Log In
              </Link>
            </div>
          </div>
        )}

        {/* ─── STEP 2: USER DETAILS ─── */}
        {step === 'details' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-bold text-stone-850">Create Account</h2>
              <p className="text-xs text-stone-400 mt-1">Join the community on NeighbourHub.</p>
            </div>

            {/* Selected Location Indicator */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 text-stone-600 text-left">
                <MapPin size={14} className="text-primary-500" />
                <div>
                  <p className="text-xs font-bold text-stone-700">{selectedLocation?.name}</p>
                  <p className="text-[9px] text-stone-405 font-bold capitalize">{selectedLocation?.type} directory</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedLocation(null)
                  setStep('location')
                }}
                className="text-[10px] font-bold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Change
              </button>
            </div>

            <div className="space-y-3">
              {/* Full Name */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input pl-9"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-9"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-9"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={registering}
              className="w-full btn-primary py-2.5 mt-2 text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
            >
              {registering ? (
                <>
                  <Loader className="animate-spin" size={13} />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account & Send OTP <ArrowRight size={13} />
                </>
              )}
            </button>

            <div className="text-center pt-4 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('location')}
                className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1 font-bold"
              >
                <ArrowLeft size={12} /> Back
              </button>
              <Link to="/login" className="text-xs font-bold text-primary-600 hover:text-primary-750 transition-colors">
                Log In instead
              </Link>
            </div>
          </form>
        )}

        {/* ─── STEP 3: OTP VERIFICATION ─── */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div className="text-center">
              <h2 className="text-lg font-bold text-stone-850">Verify Email</h2>
              <p className="text-xs text-stone-400 mt-1">
                We sent a 6-digit verification code to <span className="font-bold text-stone-700">{email}</span>.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide text-center">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[1.2em] font-mono py-2.5 border border-stone-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-stone-800 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full btn-primary py-2.5 text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
            >
              {verifying ? (
                <>
                  <Loader className="animate-spin" size={13} />
                  Verifying account...
                </>
              ) : (
                <>
                  Verify & Activate Account <ArrowRight size={13} />
                </>
              )}
            </button>

            {/* Developer Bypass Info (if email matches example.com) */}
            {email.toLowerCase().endsWith('@example.com') && (
              <div className="p-3 bg-primary-50 border border-primary-100 rounded-xl flex gap-2 text-left animate-in fade-in">
                <ShieldCheck size={15} className="text-primary-650 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-primary-750 font-bold leading-relaxed">
                  <strong>Developer Bypass:</strong> Enter <strong>123456</strong> as the OTP code.
                </p>
              </div>
            )}

            <div className="text-center pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1 font-bold mx-auto"
              >
                <ArrowLeft size={12} /> Edit Details
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
