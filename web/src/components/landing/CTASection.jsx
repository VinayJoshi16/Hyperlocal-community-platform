import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { selectIsAuthenticated } from '../../redux/slices/authSlice'
import { fadeUp, viewportOnce } from './motionPresets'

const avatars = [
  { initials: 'VJ', bg: 'bg-[#2563EB] text-white' },
  { initials: 'LS', bg: 'bg-emerald-500 text-white' },
  { initials: 'RK', bg: 'bg-amber-500 text-white' },
  { initials: 'AN', bg: 'bg-rose-500 text-white' },
  { initials: 'MD', bg: 'bg-violet-500 text-white' },
]

export default function CTASection() {
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  return (
    <section className="relative bg-stone-50 py-20 px-6 w-full overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="relative bg-gradient-to-br from-[#1C1917] to-[#0C0A09] border border-stone-850 rounded-[32px] py-16 px-8 sm:px-12 md:py-20 text-center overflow-hidden shadow-2xl"
        >
          {/* Subtle glowing center spotlight */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(120,113,108,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,113,108,0.04)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

          <div className="relative max-w-2xl mx-auto space-y-8 flex flex-col items-center">
            {/* Resident Avatars Group */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex -space-x-2.5">
                {avatars.map((av, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={viewportOnce}
                    className={`w-9 h-9 rounded-full ${av.bg} border-2 border-[#1C1917] flex items-center justify-center text-[10px] font-extrabold shadow-md`}
                  >
                    {av.initials}
                  </motion.div>
                ))}
              </div>
              <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Join 400+ residents online
              </span>
            </div>

            {/* Content Header */}
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-[44px] font-black text-white tracking-tight leading-[1.1] bg-gradient-to-r from-white via-stone-100 to-stone-300 bg-clip-text text-transparent">
                Your neighbors are already
                <br />
                <span className="text-[#3B82F6]">on the other side.</span>
              </h2>
              <p className="text-[14px] text-stone-400 leading-relaxed max-w-md mx-auto font-semibold">
                Sign up takes less than two minutes. Enter your society location, verify your email, and instantly connect to your local feed.
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              {isAuthenticated ? (
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/feed')}
                  className="bg-[#2563EB] hover:bg-[#3B82F6] text-white py-3.5 px-10 rounded-full text-xs font-bold shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_4px_30px_rgba(37,99,235,0.55)] transition-all flex items-center gap-2 group"
                >
                  Go to Feed 
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </motion.button>
              ) : (
                <motion.div 
                  whileHover={{ scale: 1.03, y: -2 }} 
                  whileTap={{ scale: 0.98 }}
                  className="inline-block"
                >
                  <Link
                    to="/register"
                    className="bg-[#2563EB] hover:bg-[#3B82F6] text-white py-3.5 px-10 rounded-full text-xs font-bold shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_4px_30px_rgba(37,99,235,0.55)] transition-all flex items-center gap-2 group"
                  >
                    Create Your Free Account 
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
