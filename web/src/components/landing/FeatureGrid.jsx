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
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUpSmall}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className={`p-6 border border-[#E7E5E4] rounded-2xl bg-[#FAFAF9] flex flex-col justify-between text-left min-h-[190px] shadow-sm hover:shadow-[0_16px_32px_-12px_rgba(28,25,23,0.12)] hover:border-stone-300 transition-shadow duration-300 ${
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
