import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ShieldCheck, Calendar, Store, Users, Sparkles } from 'lucide-react'
import { fadeUp, viewportOnce } from './motionPresets'

const features = [
  {
    icon: MapPin,
    tone: 'text-[#2563EB]',
    tile: 'bg-blue-50 border-blue-100',
    title: 'Location Scoping',
    body: 'Set your precise post visibility radius. Limit discussions to your society gates or extend them to neighboring blocks.',
    activeStyle: 'border-[#2563EB]/40 shadow-[0_15px_30px_rgba(37,99,235,0.08)] bg-white'
  },
  {
    icon: ShieldCheck,
    tone: 'text-red-500',
    tile: 'bg-red-50 border-red-100',
    title: 'RWA Verification',
    body: 'Verified administrators issue priority announcements and warnings that bypass sorting to deliver critical info.',
    activeStyle: 'border-red-300/80 shadow-[0_15px_30px_rgba(239,68,68,0.08)] bg-white'
  },
  {
    icon: Calendar,
    tone: 'text-emerald-600',
    tile: 'bg-emerald-50 border-emerald-100',
    title: 'Society Events',
    body: 'Organize residential clean-up drives, local meetups, and maintain clean attendee rosters in real-time.',
    activeStyle: 'border-emerald-300/80 shadow-[0_15px_30px_rgba(16,185,129,0.08)] bg-white'
  },
  {
    icon: Users,
    tone: 'text-violet-600',
    tile: 'bg-violet-50 border-violet-100',
    title: 'Community Circles',
    body: 'Create private or public interest groups with verified neighbors to coordinate hobbies, share advice, and chat.',
    activeStyle: 'border-violet-300/80 shadow-[0_15px_30px_rgba(139,92,246,0.08)] bg-white'
  },
  {
    icon: Store,
    tone: 'text-[#F59E0B]',
    tile: 'bg-amber-50 border-amber-100',
    title: 'Local Businesses',
    body: 'Connect with home-bakers, nearby service providers, and local tradesmen with custom community-discount deals.',
    accent: true,
    activeStyle: 'border-amber-300/80 shadow-[0_15px_30px_rgba(245,158,11,0.08)] bg-white'
  },
]

export default function FeatureGrid() {
  const containerRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false)

  const handleManualNav = (index) => {
    setActiveIndex(index)
    setIsAutoplayPaused(true)
    
    // Smooth scroll to card
    if (containerRef.current) {
      const container = containerRef.current
      const card = container.children[index]
      if (card) {
        container.scrollTo({
          left: card.offsetLeft - container.offsetLeft - 16,
          behavior: 'smooth'
        })
      }
    }
    
    // Resume autoplay after 6 seconds of inactivity
    setTimeout(() => setIsAutoplayPaused(false), 6000)
  }

  // Auto-scroll loop
  useEffect(() => {
    if (isAutoplayPaused) return

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % features.length
      setActiveIndex(nextIndex)

      if (containerRef.current) {
        const container = containerRef.current
        const card = container.children[nextIndex]
        if (card) {
          container.scrollTo({
            left: card.offsetLeft - container.offsetLeft - 16,
            behavior: 'smooth'
          })
        }
      }
    }, 2400)

    return () => clearInterval(interval)
  }, [activeIndex, isAutoplayPaused])

  return (
    <section className="relative bg-white py-24 md:py-28 px-6 border-y border-[#E7E5E4] w-full overflow-hidden">
      {/* Background Subtle Line Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="text-left max-w-2xl"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-150 text-[10px] font-extrabold text-[#2563EB] uppercase tracking-wider mb-3 select-none">
              <Sparkles size={11} className="fill-blue-50" /> Neighborhood Utilities
            </div>
            <h2 className="text-3xl md:text-[38px] font-black text-[#0F172A] tracking-tight leading-[1.1] bg-gradient-to-r from-stone-900 via-stone-850 to-stone-700 bg-clip-text">
              No global noise, no algorithm
            </h2>
            <p className="mt-4 text-[14px] text-[#64748B] leading-relaxed font-semibold max-w-xl">
              Just the clean utilities, verified notices, and direct merchant interactions that shape your immediate local surroundings.
            </p>
          </motion.div>
        </div>

        {/* Horizontal scroll container with custom animated cards */}
        <motion.div
          ref={containerRef}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="flex flex-row overflow-x-auto gap-6 pb-8 scrollbar-hide snap-x snap-mandatory scroll-smooth w-full px-2 relative z-10"
          onMouseEnter={() => setIsAutoplayPaused(true)}
          onMouseLeave={() => setIsAutoplayPaused(false)}
        >
          {features.map((f, idx) => {
            const FeatIcon = f.icon
            const isActive = idx === activeIndex
            
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={viewportOnce}
                transition={{ 
                  type: 'spring', 
                  stiffness: 100, 
                  damping: 18,
                  delay: idx * 0.08 
                }}
                className={`flex-shrink-0 w-[290px] sm:w-[325px] snap-start p-6 border rounded-2xl flex flex-col justify-between min-h-[220px] transition-all duration-300 select-none cursor-pointer ${
                  isActive 
                    ? f.activeStyle 
                    : 'bg-stone-50 border-stone-200/90 shadow-sm opacity-80 scale-[0.98]'
                }`}
                onClick={() => handleManualNav(idx)}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      animate={isActive ? { y: [0, -3, 0] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-sm ${f.tile} ${isActive ? 'scale-105' : ''}`}
                    >
                      <FeatIcon size={18} className={f.tone} strokeWidth={2.2} />
                    </motion.div>
                    
                    {isActive && (
                      <span className="text-[9px] font-extrabold text-[#2563EB] uppercase tracking-wider bg-blue-50/50 border border-blue-100 px-2 py-0.5 rounded-full">
                        Viewing
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-[13.5px] font-extrabold text-[#0F172A] tracking-tight mb-2">
                    {f.title}
                  </h3>
                  <p className="text-[12px] text-[#64748B] leading-relaxed font-semibold">
                    {f.body}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* 3. Slider Indicator Dots */}
        <div className="flex justify-center items-center gap-2.5 mt-8 select-none">
          {features.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleManualNav(idx)}
              className="relative py-2 focus:outline-none"
              title={`Go to slide ${idx + 1}`}
            >
              <div 
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex 
                    ? 'w-7 bg-[#2563EB] shadow-[0_0_10px_rgba(37,99,235,0.4)]' 
                    : 'w-2.5 bg-stone-200 hover:bg-stone-400'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
