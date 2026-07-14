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

  useEffect(() => {
    if (!user) return
    const completed = localStorage.getItem(`nh_onboarding_completed_${user.id}`)
    if (!completed) {
      setOpen(true)
    }
  }, [user])

  if (!open || !user) return null

  const steps = [
    {
      badge: 'Welcome',
      title: 'Welcome to NeighbourHub!',
      description: 'Your neighborhood community platform is ready. Let\'s take a quick 1-minute tour to explore your new tools!',
      icon: <Megaphone className="text-primary-600 w-12 h-12" />,
      color: 'bg-primary-50 text-primary-650'
    },
    {
      badge: 'Composer',
      title: 'Share & Polish with AI',
      description: 'Publish updates, notices, polls, or lost & found items. Stuck on phrasing? Use "AI Polish" to rewrite posts professionally in one click!',
      icon: <Sparkles className="text-indigo-600 w-12 h-12" />,
      color: 'bg-indigo-50 text-indigo-650'
    },
    {
      badge: 'Location Selector',
      title: 'Sync Location via GPS',
      description: 'Traveling or moved homes? Change your community from the Navbar. Click "Change Location" to locate via GPS or search manually.',
      icon: <MapPin className="text-green-600 w-12 h-12" />,
      color: 'bg-green-50 text-green-650'
    },
    {
      badge: 'Helpline Widget',
      title: 'National Emergency Hotlines',
      description: 'Access Indian universal helpline numbers (112, 100, 101, 102, 108, 1091) inside the scrollable sidebar widget instantly.',
      icon: <AlertTriangle className="text-red-500 w-12 h-12" />,
      color: 'bg-red-50 text-red-650'
    },
    {
      badge: 'AI Translator',
      title: 'Multilingual Auto-Translate',
      description: 'Break language barriers! Click "Translate" in the footer of any post card to instantly translate content to Hindi, Tamil, Telugu, Marathi, or Spanish.',
      icon: <Globe className="text-purple-600 w-12 h-12" />,
      color: 'bg-purple-50 text-purple-650'
    }
  ]

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

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-2xl max-w-sm w-full p-6 text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={handleComplete}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-1.5 rounded-full hover:bg-stone-50 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Dynamic Icon */}
        <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${stepInfo.color} mb-6 mt-2 shadow-[0_4px_16px_rgba(0,0,0,0.02)]`}>
          {stepInfo.icon}
        </div>

        {/* Badge */}
        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-stone-105 text-stone-500 mb-2 border border-stone-200/50">
          {stepInfo.badge}
        </span>

        {/* Slide Title */}
        <h2 className="text-lg font-black text-stone-850 tracking-tight leading-snug mb-3">
          {stepInfo.title}
        </h2>

        {/* Slide Description */}
        <p className="text-xs text-stone-500 font-semibold leading-relaxed px-2 mb-8 min-h-[50px]">
          {stepInfo.description}
        </p>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep ? 'w-5 bg-primary-600' : 'w-1.5 bg-stone-200'
                }`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button 
                onClick={handleBack}
                className="h-8 px-3 text-stone-500 hover:text-stone-700 font-bold text-xs flex items-center gap-0.5 rounded-lg hover:bg-stone-50 transition-colors"
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
            <button 
              onClick={handleNext}
              className={`h-8 px-4 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1 ${
                currentStep === steps.length - 1
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-100'
                  : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-100'
              }`}
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Get Started <Check size={13} className="stroke-[2.5]" />
                </>
              ) : (
                <>
                  Next <ChevronRight size={13} className="stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
