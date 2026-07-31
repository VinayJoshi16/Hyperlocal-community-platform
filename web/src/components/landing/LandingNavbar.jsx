import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { selectIsAuthenticated } from '../../redux/slices/authSlice'
import { expoEase } from './motionPresets'

export default function LandingNavbar() {
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY
      
      // Blur and shrink trigger
      setScrolled(currentScrollY > 15)

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false)
      } else {
        setVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [lastScrollY])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: visible ? 0 : -80, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4, ease: expoEase }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-stone-50/90 backdrop-blur-md border-b border-[#E7E5E4] shadow-[0_1px_0_rgba(28,25,23,0.02)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className={`max-w-[1440px] mx-auto px-6 lg:px-10 flex items-center justify-between transition-all duration-300 ${
        scrolled ? 'h-13 sm:h-14' : 'h-16'
      }`}>
        <div
          className="flex items-center gap-2 cursor-pointer select-none group"
          onClick={() => navigate('/')}
        >
          <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-extrabold text-xs shadow-sm transition-transform duration-300 group-hover:-rotate-6">
            N
          </div>
          <span className="text-base font-extrabold tracking-tight text-[#1C1917]">
            Neighbour<span className="text-[#2563EB]">Hub</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-[#57534E]">
          <a href="#how-it-works" className="hover:text-[#1C1917] transition-colors relative py-1 group">
            How it works
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2563EB] transition-all duration-300 group-hover:w-full" />
          </a>
          <a href="#inside" className="hover:text-[#1C1917] transition-colors relative py-1 group">
            Inside the feed
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2563EB] transition-all duration-300 group-hover:w-full" />
          </a>
          <a href="#stories" className="hover:text-[#1C1917] transition-colors relative py-1 group">
            Stories
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2563EB] transition-all duration-300 group-hover:w-full" />
          </a>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/feed')}
              className="btn-primary py-2.5 px-4.5 text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200"
            >
              Go to Feed <ArrowRight size={13} className="ml-0.5" />
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-bold text-[#78716C] hover:text-[#1C1917] transition-colors duration-150 relative py-1 group"
              >
                Log In
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2563EB] transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link
                to="/register"
                className="btn-primary py-2.5 px-4.5 text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}
