import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { selectIsAuthenticated } from '../../redux/slices/authSlice'
import { fadeUp, viewportOnce } from './motionPresets'

export default function CTASection() {
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  return (
    <section className="relative bg-[#FAFAF9] py-24 md:py-28 px-6 text-center w-full overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: 'radial-gradient(#D6D3D1 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(ellipse 60% 80% at 50% 50%, black 30%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 80% at 50% 50%, black 30%, transparent 85%)',
        }}
      />
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="relative max-w-2xl mx-auto space-y-6"
      >
        <h2 className="text-3xl md:text-[42px] font-extrabold text-[#1C1917] tracking-tight leading-[1.1]">
          Your neighbors are already
          <br />
          <span className="font-display italic font-medium text-[#2563EB]">on the other side.</span>
        </h2>
        <p className="text-[15px] text-[#78716C] leading-relaxed max-w-md mx-auto font-medium">
          Sign up takes less than two minutes. Enter your society location, verify your email, and
          instantly connect to your local feed.
        </p>
        <div className="pt-3">
          {isAuthenticated ? (
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/feed')}
              className="btn-primary py-3.5 px-8 text-sm font-bold shadow-md hover:shadow-lg"
            >
              Go to Feed <ArrowRight size={14} className="ml-1" />
            </motion.button>
          ) : (
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="inline-block">
              <Link
                to="/register"
                className="btn-primary py-3.5 px-8 text-sm font-bold shadow-md hover:shadow-lg"
              >
                Create Your Free Account <ArrowRight size={14} className="ml-1" />
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
