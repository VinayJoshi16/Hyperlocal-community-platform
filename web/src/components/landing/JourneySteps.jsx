import { motion } from 'framer-motion'
import { MapPinned, MailCheck, MessageCircle } from 'lucide-react'
import { fadeUp, fadeUpSmall, stagger, viewportOnce } from './motionPresets'

const steps = [
  {
    n: '01',
    icon: MapPinned,
    title: 'Place your pin',
    body: 'Country, state, city, area, society — set your exact address on our location hierarchy in under a minute.',
  },
  {
    n: '02',
    icon: MailCheck,
    title: 'Verify your email',
    body: 'A one-time code confirms it’s really you before you can see or post inside your neighborhood feed.',
  },
  {
    n: '03',
    icon: MessageCircle,
    title: 'See only what’s yours',
    body: 'Notices, events and businesses scoped to your radius — nothing from three cities over.',
  },
]

export default function JourneySteps() {
  return (
    <section id="how-it-works" className="bg-[#FAFAF9] py-24 md:py-28 px-6 w-full">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="max-w-xl mb-16"
        >
          <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">
            Getting started
          </span>
          <h2 className="mt-3 text-3xl md:text-[34px] font-extrabold text-[#1C1917] tracking-tight">
            Three minutes from stranger to neighbor
          </h2>
        </motion.div>

        <motion.div
          variants={stagger(0.15)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative"
        >
          {/* Animated Connecting Lines & Badges */}
          <div className="hidden md:block absolute top-[38px] left-[16.66%] w-[33.33%] h-px bg-[#E7E5E4] overflow-visible">
            <motion.div
              className="absolute -top-[14px] left-0 text-[#2563EB] bg-white w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center shadow-md z-20"
              animate={{
                left: ['0%', '100%', '100%', '100%', '100%'],
                opacity: [0, 1, 1, 0, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                times: [0, 0.38, 0.39, 0.9, 1]
              }}
            >
              <MapPinned size={14} className="stroke-[2.2]" />
            </motion.div>
          </div>

          <div className="hidden md:block absolute top-[38px] left-[50%] w-[33.33%] h-px bg-[#E7E5E4] overflow-visible">
            <motion.div
              className="absolute -top-[14px] left-0 text-[#2563EB] bg-white w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center shadow-md z-20"
              animate={{
                left: ['0%', '0%', '100%', '100%', '100%'],
                opacity: [0, 0, 1, 0, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                times: [0, 0.4, 0.78, 0.79, 1]
              }}
            >
              <MailCheck size={14} className="stroke-[2.2]" />
            </motion.div>
          </div>

          {steps.map((step) => (
            <motion.div key={step.n} variants={fadeUpSmall} className="relative text-left">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-[76px] h-[76px] rounded-2xl bg-white border border-[#E7E5E4] shadow-sm flex items-center justify-center relative z-10">
                  {/* Radar Pulse & Bouncy Notification Badge for Step 3 (Radius) */}
                  {step.n === '03' && (
                    <>
                      <motion.span
                        className="absolute inset-0 rounded-2xl bg-blue-400/20 pointer-events-none"
                        animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                      />
                      <motion.span
                        className="absolute inset-0 rounded-2xl bg-blue-400/10 pointer-events-none"
                        animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.7 }}
                      />
                      {/* Synchronized Notification Popup Badge */}
                      <motion.span
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#2563EB] text-white text-[9px] font-extrabold flex items-center justify-center shadow-md border-2 border-white select-none relative z-20"
                        animate={{
                          scale: [0, 0, 1.1, 1, 0],
                          opacity: [0, 0, 1, 1, 0]
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          times: [0, 0.78, 0.83, 0.95, 1],
                          ease: 'easeInOut'
                        }}
                      >
                        1
                      </motion.span>
                    </>
                  )}
                  <step.icon size={26} className="text-[#2563EB] relative z-10" strokeWidth={1.75} />
                </div>
                <span className="font-display text-4xl italic text-stone-300 select-none">
                  {step.n}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-[#1C1917] mb-1.5">{step.title}</h3>
              <p className="text-[13.5px] text-[#78716C] leading-relaxed font-medium max-w-[280px]">
                {step.body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
