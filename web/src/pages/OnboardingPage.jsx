// Shown once after first signup - two ways to set location:
// 1. GPS (browser geolocation - free, no API key needed)
// 2. Manual search by name

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { MapPin, Navigation, Search, ArrowRight, Loader, CheckCircle } from 'lucide-react'

export default function OnboardingPage() {
  const [gpsError, setGpsError]       = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [step, setStep]               = useState('choose')

  // GPS flow
  function handleUseGPS() {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const result = await dispatch(
          setLocationFromGPS({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        )
        if (result.meta.requestStatus === 'fulfilled') {
          setStep('done')
          setTimeout(() => navigate('/feed'), 1200)
        }
      },
      (err) => {
        setGpsError('Location denied. Please search manually.')
        setStep('search')
      }
    )
  }

  // Search with 400ms debounce
  useEffect(() => {
    if (searchQuery.length < 2) return
    const timer = setTimeout(() => dispatch(searchLocations(searchQuery)), 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Done state → success icon → redirect
  if (step === 'done') return <SuccessScreen />

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-sm">
        {/* GPS button → manual search → results list */}
      </div>
    </div>
  )
}