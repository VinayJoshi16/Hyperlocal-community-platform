import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { MapPin, ArrowRight, ShieldCheck } from 'lucide-react'
import { selectIsAuthenticated } from '../../redux/slices/authSlice'
import SocietyFacade from './SocietyFacade'
import { stagger, textHeading, textParagraph, revealButton, revealImage, fadeUpSmall } from './motionPresets'

export default function Hero() {
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  return (
    <section className="relative w-full pt-14 md:pt-20 pb-20 md:pb-28 overflow-hidden">
      {/* Faint locator-grid backdrop — nods to the location hierarchy the product is built on */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(#E7E5E4 1px, transparent 1px), linear-gradient(90deg, #E7E5E4 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 70% 55% at 30% 0%, black 40%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 55% at 30% 0%, black 40%, transparent 90%)',
        }}
      />

      <motion.div
        variants={stagger(0.1, 0.1)}
        initial="hidden"
        animate="show"
        className="relative max-w-[1440px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-center"
      >
        {/* Left: pitch */}
        <div className="lg:col-span-7 space-y-7 text-left">
          <motion.div
            variants={fadeUpSmall}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E7E5E4] text-[10px] font-bold text-[#78716C] uppercase tracking-widest select-none shadow-sm"
          >
            <MapPin size={11} className="text-[#2563EB]" />
            <span>Country → State → City → Area → Society</span>
          </motion.div>

          <motion.h1
            variants={textHeading}
            className="text-[42px] sm:text-[52px] md:text-[60px] font-extrabold tracking-[-0.02em] text-[#1C1917] leading-[1.04] max-w-2xl"
          >
            The block you live on,
            <br />
            <span className="font-display italic font-medium text-[#2563EB]">
              finally online.
            </span>
          </motion.h1>

          <motion.p
            variants={textParagraph}
            className="text-[16px] md:text-[17px] text-[#78716C] leading-relaxed max-w-xl font-medium"
          >
            NeighbourHub is a private, verified feed for one address at a time —
            RWA notices that reach every flat, businesses two lanes away, and an
            emergency alert that never gets lost in a crowded app.
          </motion.p>

          <motion.div variants={revealButton} className="pt-2 flex flex-wrap items-center gap-3.5">
            {isAuthenticated ? (
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/feed')}
                className="btn-primary py-3.5 px-7 text-sm font-extrabold shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                Enter Application <ArrowRight size={15} className="ml-1" />
              </motion.button>
            ) : (
              <>
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/register"
                    className="btn-primary py-3.5 px-7 text-sm font-extrabold shadow-md hover:shadow-lg transition-shadow duration-200"
                  >
                    Join Your Neighborhood <ArrowRight size={15} className="ml-1" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/login"
                    className="btn-secondary py-3.5 px-7 text-sm font-extrabold shadow-md hover:shadow-lg transition-shadow duration-200"
                  >
                    Sign In
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>

          <motion.div
            variants={fadeUpSmall}
            className="flex items-center gap-2 text-[12px] text-[#78716C] font-semibold pt-2"
          >
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Verified email address & neighborhood boundaries required.</span>
          </motion.div>
        </div>

        {/* Right: signature visual */}
        <motion.div
          variants={revealImage}
          className="lg:col-span-5 flex items-center justify-center"
        >
          <SocietyFacade />
        </motion.div>
      </motion.div>
    </section>
  )
}
