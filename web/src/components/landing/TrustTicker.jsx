import { motion } from 'framer-motion'

const lines = [
  'RWA notice reached 482 flats in Bandra West',
  'Oven Fresh Bakery redeemed 65 discount codes',
  'Lost cat reunited within 4 hours in Koramangala',
  'Emergency water alert acknowledged by 91% of residents',
  'Sunday clean-up drive: 18 neighbors RSVP’d',
  'New verified society onboarded in Whitefield',
]

export default function TrustTicker() {
  const track = [...lines, ...lines]
  return (
    <div className="relative w-full border-y border-[#E7E5E4] bg-white py-3.5 overflow-hidden">
      <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white to-transparent z-10" />
      <motion.div
        className="flex items-center gap-10 whitespace-nowrap w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
      >
        {track.map((line, i) => (
          <span key={i} className="flex items-center gap-2 text-[12px] font-semibold text-[#78716C]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            {line}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
