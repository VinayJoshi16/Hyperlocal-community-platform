import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { ShieldCheck, Store, Calendar } from 'lucide-react'

// Deterministic pseudo-random so the facade looks organic but doesn't
// reshuffle on every re-render.
function seededSequence(count, seed = 7) {
  let s = seed
  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  return Array.from({ length: count }, () => rand())
}

const COLS = 7
const ROWS = 6

export default function SocietyFacade() {
  const windows = useMemo(() => {
    const total = COLS * ROWS
    const delays = seededSequence(total)
    const lit = seededSequence(total, 42)
    return Array.from({ length: total }, (_, i) => ({
      id: i,
      col: i % COLS,
      row: Math.floor(i / COLS),
      delay: delays[i] * 3.2,
      baseLit: lit[i] > 0.45,
    }))
  }, [])

  const cell = 34
  const gap = 10
  const width = COLS * cell + (COLS - 1) * gap
  const height = ROWS * cell + (ROWS - 1) * gap

  return (
    <div className="relative w-full max-w-[420px] mx-auto select-none">
      {/* Facade card */}
      <div className="relative bg-[#1C1917] rounded-[28px] p-7 pb-9 shadow-[0_30px_60px_-15px_rgba(28,25,23,0.35)] overflow-hidden">
        {/* Roofline / signage */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-400">
              Sector 14, Block C
            </span>
          </div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-500">
            Live
          </span>
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="auto"
          role="img"
          aria-label="Illustration of a residential building with windows lighting up as neighbors post updates"
        >
          {windows.map((w) => {
            const x = w.col * (cell + gap)
            const y = w.row * (cell + gap)
            return (
              <motion.rect
                key={w.id}
                x={x}
                y={y}
                width={cell}
                height={cell}
                rx={6}
                fill={w.baseLit ? '#F59E0B' : '#3A3532'}
                initial={{ opacity: w.baseLit ? 0.35 : 0.5 }}
                animate={{
                  opacity: w.baseLit ? [0.35, 0.95, 0.55] : [0.5, 0.5, 0.5],
                  fill: w.baseLit
                    ? ['#3A3532', '#F59E0B', '#F59E0B']
                    : ['#3A3532', '#3A3532', '#3A3532'],
                }}
                transition={{
                  duration: 4.5,
                  delay: w.delay,
                  repeat: Infinity,
                  repeatDelay: 3 + (w.id % 5),
                  ease: 'easeInOut',
                }}
              />
            )
          })}
        </svg>

        {/* Ground line */}
        <div className="mt-7 h-px w-full bg-gradient-to-r from-transparent via-stone-700 to-transparent" />
        <p className="mt-4 text-center text-[11px] font-semibold text-stone-500">
          482 windows. 482 neighbors. One feed.
        </p>
      </div>

      {/* Floating activity chips */}
      <motion.div
        className="absolute -left-6 top-10 bg-white rounded-xl border border-[#E7E5E4] shadow-lg px-3 py-2 flex items-center gap-2 max-w-[190px]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, -6] }}
        transition={{ duration: 4, delay: 0.6, repeat: Infinity, repeatDelay: 6, ease: 'easeInOut' }}
      >
        <span className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={12} className="text-red-500" />
        </span>
        <span className="text-[10.5px] font-bold text-[#1C1917] leading-tight">
          Water supply notice posted
        </span>
      </motion.div>

      <motion.div
        className="absolute -right-7 top-[38%] bg-white rounded-xl border border-[#E7E5E4] shadow-lg px-3 py-2 flex items-center gap-2 max-w-[190px]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, -6] }}
        transition={{ duration: 4, delay: 2.4, repeat: Infinity, repeatDelay: 6, ease: 'easeInOut' }}
      >
        <span className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
          <Store size={12} className="text-[#F59E0B]" />
        </span>
        <span className="text-[10.5px] font-bold text-[#1C1917] leading-tight">
          Bakery dropped a discount
        </span>
      </motion.div>

      <motion.div
        className="absolute -left-8 bottom-6 bg-white rounded-xl border border-[#E7E5E4] shadow-lg px-3 py-2 flex items-center gap-2 max-w-[190px]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, -6] }}
        transition={{ duration: 4, delay: 4.2, repeat: Infinity, repeatDelay: 6, ease: 'easeInOut' }}
      >
        <span className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <Calendar size={12} className="text-emerald-600" />
        </span>
        <span className="text-[10.5px] font-bold text-[#1C1917] leading-tight">
          Clean-up drive RSVP open
        </span>
      </motion.div>
    </div>
  )
}
