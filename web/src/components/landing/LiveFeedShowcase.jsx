import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageSquare } from 'lucide-react'
import { fadeUp, viewportOnce } from './motionPresets'

const tabs = [
  {
    key: 'notice',
    label: 'RWA Notice',
    dot: 'bg-red-500',
    card: (
      <>
        <div className="flex gap-2.5 items-center mb-3">
          <img
            src="https://i.pravatar.cc/150?img=53"
            alt=""
            className="w-9 h-9 rounded-full object-cover border border-[#E7E5E4]"
          />
          <div>
            <h4 className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
              Rajesh Chawla
              <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 text-[8px] font-bold border border-red-100 uppercase tracking-wide">
                RWA President
              </span>
            </h4>
            <p className="text-[10px] text-[#78716C] font-medium">Bandra West • 2 hrs ago</p>
          </div>
        </div>
        <h3 className="text-sm font-extrabold text-[#1C1917] flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Water pipeline maintenance tomorrow
        </h3>
        <p className="text-xs text-[#78716C] leading-relaxed">
          Water supply will be suspended tomorrow (Tuesday) from 9:00 AM to 4:00 PM for repair works.
          Please store adequate water.
        </p>
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-6 text-stone-400 text-xs font-bold">
          <span className="flex items-center gap-1.5"><Heart size={14} /> 42</span>
          <span className="flex items-center gap-1.5"><MessageSquare size={14} /> 12</span>
        </div>
      </>
    ),
  },
  {
    key: 'business',
    label: 'Local Business',
    dot: 'bg-[#F59E0B]',
    card: (
      <>
        <div className="flex gap-2.5 items-center mb-3">
          <img
            src="https://i.pravatar.cc/150?img=68"
            alt=""
            className="w-9 h-9 rounded-full object-cover border border-amber-100"
          />
          <div>
            <h4 className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
              Oven Fresh Bakery
              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[8px] font-bold border border-amber-100 uppercase tracking-wide">
                Local Business
              </span>
            </h4>
            <p className="text-[10px] text-[#78716C] font-medium">0.3 km away • Active now</p>
          </div>
        </div>
        <h3 className="text-sm font-extrabold text-[#1C1917] mb-1">
          Fresh sourdough & chai spiced loaves
        </h3>
        <p className="text-xs text-[#78716C] leading-relaxed mb-3">
          Hey neighbors! Fresh batch is out of the oven. Mention{' '}
          <span className="font-bold text-[#F59E0B]">NEIGHBOUR15</span> for 15% off at the counter.
        </p>
        <div className="overflow-hidden rounded-xl border border-stone-200/60 max-h-40 w-full bg-stone-50/50">
          <img
            src="/fresh_bakery_preview.png"
            alt="Fresh bakery items"
            className="w-full object-cover max-h-40 aspect-video"
          />
        </div>
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-6 text-stone-400 text-xs font-bold">
          <span className="flex items-center gap-1.5"><Heart size={14} /> 65</span>
          <span className="flex items-center gap-1.5"><MessageSquare size={14} /> 8</span>
        </div>
      </>
    ),
  },
  {
    key: 'event',
    label: 'Society Event',
    dot: 'bg-emerald-500',
    card: (
      <>
        <div className="flex gap-2.5 items-center mb-3">
          <img
            src="https://i.pravatar.cc/150?img=9"
            alt=""
            className="w-9 h-9 rounded-full object-cover border border-[#E7E5E4]"
          />
          <div>
            <h4 className="text-xs font-bold text-[#1C1917]">Priya Sharma</h4>
            <p className="text-[10px] text-[#78716C] font-medium">Bandra West • 5 hrs ago</p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-1">
          <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[8px] font-bold border border-emerald-100 uppercase tracking-wide">
            RSVP Event
          </span>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50/50 border border-emerald-100 px-2 py-0.5 rounded-full">
            18 attending
          </span>
        </div>
        <h3 className="text-sm font-extrabold text-[#1C1917] mb-1">
          Sunday society clean-up & tree plantation
        </h3>
        <p className="text-xs text-[#78716C] leading-relaxed mb-3">
          Join us this Sunday at 8 AM in the East Lawn. Saplings and tools will be provided. Light
          breakfast afterwards!
        </p>
        <div className="overflow-hidden rounded-xl border border-stone-200/60 max-h-40 w-full bg-stone-50/50">
          <img
            src="/gardening_event_preview.png"
            alt="Gardening drive"
            className="w-full object-cover max-h-40 aspect-video"
          />
        </div>
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-6 text-stone-400 text-xs font-bold">
          <span className="flex items-center gap-1.5"><Heart size={14} /> 28</span>
          <span className="flex items-center gap-1.5"><MessageSquare size={14} /> 14</span>
        </div>
      </>
    ),
  },
]

export default function LiveFeedShowcase() {
  const [active, setActive] = useState('notice')
  const activeTab = tabs.find((t) => t.key === active)

  return (
    <section id="inside" className="bg-[#FAFAF9] py-24 md:py-28 px-6 w-full">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="lg:col-span-5 text-left"
        >
          <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">
            Inside the feed
          </span>
          <h2 className="mt-3 text-3xl md:text-[34px] font-extrabold text-[#1C1917] tracking-tight max-w-md">
            One feed, three kinds of neighbor
          </h2>
          <p className="mt-4 text-[15px] text-[#78716C] leading-relaxed font-medium max-w-md">
            The RWA, the corner bakery, and the person two floors up all post to the same place —
            scoped, verified, and sorted by what actually matters to your address.
          </p>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border transition-all duration-200 ${
                  active === tab.key
                    ? 'bg-[#1C1917] text-white border-[#1C1917] shadow-md'
                    : 'bg-white text-[#57534E] border-[#E7E5E4] hover:border-stone-300'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="lg:col-span-7 flex justify-center"
        >
          <div className="relative w-full max-w-md">
            {/* depth cards behind */}
            <div className="absolute inset-x-4 -bottom-3 h-full rounded-[26px] bg-white border border-[#E7E5E4] opacity-60" />
            <div className="absolute inset-x-2 -bottom-1.5 h-full rounded-[26px] bg-white border border-[#E7E5E4] opacity-80" />

            {/* app-shell frame: gives the card the feel of a real screenshot */}
            <div className="relative bg-[#1C1917] rounded-[26px] p-2.5 shadow-[0_30px_60px_-15px_rgba(28,25,23,0.3)]">
              <div className="flex items-center gap-1.5 px-2.5 py-2">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]/70" />
                <span className="w-2 h-2 rounded-full bg-stone-500" />
                <span className="w-2 h-2 rounded-full bg-stone-500" />
                <span className="ml-2 text-[9.5px] font-bold text-stone-400 tracking-wide">
                  neighbourhub.app/feed
                </span>
              </div>
              <div className="bg-[#FAFAF9] rounded-[18px] p-4 min-h-[280px] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-[0_20px_40px_-15px_rgba(28,25,23,0.12)] text-left"
                  >
                    {activeTab.card}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
