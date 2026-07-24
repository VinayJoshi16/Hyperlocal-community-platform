import { useEffect, useRef } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { fadeUp, stagger, viewportOnce } from './motionPresets'

function Counter({ to, suffix = '', decimals = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => v.toFixed(decimals))

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1] })
      return controls.stop
    }
  }, [inView, to])

  return (
    <span ref={ref} className="font-display italic">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}

const stats = [
  { to: 480, suffix: '+', label: 'Verified societies onboarded' },
  { to: 92, suffix: '%', label: 'Emergency notices acknowledged same day' },
  { to: 3, decimals: 1, suffix: ' min', label: 'Average time from signup to first post' },
  { to: 1200, suffix: '+', label: 'Local businesses listed' },
]

export default function StatsBand() {
  return (
    <section className="bg-[#1C1917] py-20 md:py-24 px-6 w-full">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="text-left">
              <p className="text-4xl md:text-[44px] font-medium text-white leading-none">
                <Counter to={s.to} suffix={s.suffix} decimals={s.decimals} />
              </p>
              <p className="mt-3 text-[12.5px] font-semibold text-stone-400 leading-snug max-w-[180px]">
                {s.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
