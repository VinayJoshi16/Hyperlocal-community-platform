import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  X, ChevronRight, ChevronLeft, Sparkles, MapPin, 
  AlertTriangle, Globe, Megaphone, Check 
} from 'lucide-react'
import { selectUser } from '../../redux/slices/authSlice'

export default function AppTour() {
  const user = useSelector(selectUser)
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [coords, setCoords] = useState(null)

  const steps = [
    {
      badge: 'Welcome',
      title: 'Welcome to NeighbourHub!',
      description: 'Let\'s take a quick 1-minute guided tour to explore how to navigate your neighborhood platform.',
      selector: '#tour-logo',
      icon: <Megaphone className="text-primary-600 w-10 h-10" />,
      color: 'bg-primary-50 text-primary-650'
    },
    {
      badge: 'Composer',
      title: 'Create & Polish Posts',
      description: 'Need to write an announcement, list a lost pet, or create a poll? Use the composer here and click "AI Polish" to write professionally.',
      selector: '#tour-composer',
      icon: <Sparkles className="text-indigo-600 w-10 h-10" />,
      color: 'bg-indigo-50 text-indigo-650'
    },
    {
      badge: 'Location Selector',
      title: 'Sync Your Location Live',
      description: 'Update your society or town instantly when you travel. Click here to use your current GPS coordinates or search mapped areas.',
      selector: '#tour-location',
      icon: <MapPin className="text-green-600 w-10 h-10" />,
      color: 'bg-green-50 text-green-650'
    },
    {
      badge: 'Emergency Hotlines',
      title: 'Universal Nationwide Helplines',
      description: 'Quick access to Indian national helpline numbers (112, 100, 101, 102, 108, 1091). Scroll this widget to view all.',
      selector: '#tour-hotlines',
      icon: <AlertTriangle className="text-red-500 w-10 h-10" />,
      color: 'bg-red-50 text-red-650'
    },
    {
      badge: 'AI Translator',
      title: 'Auto-Translate Feed Content',
      description: 'Break community language barriers. Click this translate button to read any post in Hindi, Tamil, Telugu, Marathi, or Spanish.',
      selector: '#tour-translate',
      icon: <Globe className="text-purple-600 w-10 h-10" />,
      color: 'bg-purple-50 text-purple-650'
    }
  ]

  useEffect(() => {
    if (!user) return
    const completed = localStorage.getItem(`nh_onboarding_completed_${user.id}`)
    if (!completed) {
      setOpen(true)
    }
  }, [user])

  // Track coordinates of the highlighted DOM element
  useEffect(() => {
    if (!open || !user) return

    const updateCoords = () => {
      const step = steps[currentStep]
      if (!step || !step.selector) {
        setCoords(null)
        return
      }

      const element = document.querySelector(step.selector)
      if (element) {
        const rect = element.getBoundingClientRect()
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom + window.scrollY,
          right: rect.right + window.scrollX
        })
        
        // Smoothly scroll the highlighted element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        setCoords(null)
      }
    }

    // Set a tiny timeout to allow DOM rendering (e.g. if tabs are opening/closing)
    const timer = setTimeout(updateCoords, 250)

    window.addEventListener('resize', updateCoords)
    window.addEventListener('scroll', updateCoords)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateCoords)
      window.removeEventListener('scroll', updateCoords)
    }
  }, [currentStep, open, user])

  if (!open || !user) return null

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem(`nh_onboarding_completed_${user.id}`, 'true')
    setOpen(false)
  }

  const stepInfo = steps[currentStep]

  // Calculate Tooltip Styles
  let tooltipStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '340px',
    zIndex: 9999
  }

  if (coords) {
    const tooltipWidth = 340
    // Center tooltip on element, bound inside window viewports
    const leftPos = Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, coords.left + (coords.width / 2) - (tooltipWidth / 2)))
    
    // Check if there is enough space below the element, otherwise display above
    const spaceBelow = window.innerHeight - (coords.bottom - window.scrollY)
    const placeAbove = spaceBelow < 220
    
    tooltipStyle = {
      position: 'absolute',
      top: placeAbove ? (coords.top - 12) : (coords.bottom + 12),
      left: `${leftPos}px`,
      transform: placeAbove ? 'translateY(-100%)' : 'none',
      width: `${tooltipWidth}px`,
      zIndex: 9999,
      transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }

  return (
    <div className="absolute inset-0 z-[9998] pointer-events-none">
      {/* Fullscreen Backdrop Mask */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-auto z-[9997]" />

      {/* Highlight Cut-out Window */}
      {coords && (
        <div 
          style={{
            position: 'absolute',
            top: coords.top - 6,
            left: coords.left - 6,
            width: coords.width + 12,
            height: coords.height + 12,
            borderRadius: '12px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
            zIndex: 9998
          }}
        />
      )}

      {/* Floating Tooltip Card */}
      <div 
        style={tooltipStyle}
        className="bg-white rounded-2xl border border-stone-200 shadow-2xl p-5 pointer-events-auto select-none flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-stone-100 text-stone-500 border border-stone-200/45">
            {stepInfo.badge}
          </span>
          <button 
            onClick={handleComplete}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-50 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex gap-4 items-start mb-6">
          <div className={`p-2.5 rounded-xl ${stepInfo.color} flex-shrink-0 shadow-sm`}>
            {stepInfo.icon}
          </div>
          <div className="text-left flex-1 min-w-0">
            <h4 className="text-sm font-black text-stone-850 tracking-tight leading-snug mb-1">
              {stepInfo.title}
            </h4>
            <p className="text-[11px] text-stone-500 font-semibold leading-relaxed">
              {stepInfo.description}
            </p>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep ? 'w-4.5 bg-primary-600' : 'w-1.5 bg-stone-200'
                }`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {currentStep > 0 && (
              <button 
                onClick={handleBack}
                className="h-7 px-2.5 text-stone-500 hover:text-stone-700 font-bold text-[10px] flex items-center gap-0.5 rounded-lg hover:bg-stone-50 transition-colors"
              >
                <ChevronLeft size={13} /> Back
              </button>
            )}
            <button 
              onClick={handleNext}
              className={`h-7 px-3.5 font-bold text-[10px] rounded-lg shadow-sm transition-all flex items-center gap-1 ${
                currentStep === steps.length - 1
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-150'
                  : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-150'
              }`}
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Done <Check size={11} className="stroke-[2.5]" />
                </>
              ) : (
                <>
                  Next <ChevronRight size={11} className="stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
