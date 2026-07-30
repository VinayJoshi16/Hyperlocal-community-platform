import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MapPin, ShieldCheck, Calendar, Store } from 'lucide-react'
import { fadeUp, fadeUpSmall, stagger, viewportOnce } from './motionPresets'

const features = [
  {
    icon: MapPin,
    tone: 'text-[#2563EB]',
    tile: 'bg-blue-50',
    title: 'Location scoping',
    body: 'Choose the radius of your posts. Keep it inside your society gates, or spread it to nearby blocks.',
  },
  {
    icon: ShieldCheck,
    tone: 'text-red-500',
    tile: 'bg-red-50',
    title: 'RWA verification',
    body: 'Verified administrators publish emergency notices that bypass standard feeds to grab immediate attention.',
  },
  {
    icon: Calendar,
    tone: 'text-emerald-600',
    tile: 'bg-emerald-50',
    title: 'Society events',
    body: 'Create clean meetups, handle attendee lists, and coordinate local neighborhood initiatives.',
  },
  {
    icon: Store,
    tone: 'text-[#F59E0B]',
    tile: 'bg-amber-50',
    title: 'Business directory',
    body: 'Support local vendors, home-bakers, and nearby service providers, highlighting direct community deals.',
    accent: true,
  },
]

export default function FeatureGrid() {
  const containerRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Autoplay 2-second horizontal scroll
  useEffect(() => {
    if (isHovered) return

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
    }, 2000)

    return () => clearInterval(interval)
  }, [activeIndex, isHovered])

  return (
    <section className="bg-white py-24 md:py-28 px-6 border-y border-[#E7E5E4] w-full">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="text-left max-w-2xl mb-16"
        >
          <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">
            Built for real local needs
          </span>
          <h2 className="mt-3 text-3xl md:text-[34px] font-extrabold text-[#1C1917] tracking-tight">
            No global noise, no algorithm
          </h2>
          <p className="mt-3 text-[15px] text-[#78716C] leading-relaxed font-medium">
            Just the utility, notices, and interactions that shape your immediate surroundings.
          </p>
        </motion.div>

        <motion.div
          ref={containerRef}
          variants={stagger(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="flex flex-row overflow-x-auto gap-6 pb-6 scrollbar-hide snap-x snap-mandatory scroll-smooth w-full px-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {features.map((f, idx) => (
            <motion.div
              key={f.title}
              variants={{
                hidden: { opacity: 0, x: 40 },
                show: { 
                  opacity: 1, 
                  x: 0, 
                  transition: { type: 'spring', stiffness: 120, damping: 18 } 
                }
              }}
              whileHover={{ 
                y: -6,
                boxShadow: '0 20px 40px -15px rgba(28,25,23,0.08)'
              }}
              className={`flex-shrink-0 w-[290px] sm:w-[325px] snap-start p-6 border border-[#E7E5E4] rounded-2xl bg-stone-50 flex flex-col justify-between text-left min-h-[190px] shadow-sm hover:border-stone-300 transition-all duration-300 ${
                f.accent ? 'border-l-2 border-l-[#F59E0B]' : ''
              }`}
            >
              <div>
                <div className={`w-9 h-9 rounded-lg ${f.tile} flex items-center justify-center mb-4`}>
                  <f.icon size={17} className={f.tone} strokeWidth={2} />
                </div>
                <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-widest mb-1.5">
                  {f.title}
                </h3>
                <p className="text-xs text-[#78716C] leading-relaxed font-medium">{f.body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
