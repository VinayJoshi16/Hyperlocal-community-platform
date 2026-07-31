import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import LandingNavbar from '../components/landing/LandingNavbar'
import Hero from '../components/landing/Hero'
import TrustTicker from '../components/landing/TrustTicker'
import SocialFeedShowcase from '../components/landing/SocialFeedShowcase'
import JourneySteps from '../components/landing/JourneySteps'
import FeatureGrid from '../components/landing/FeatureGrid'
import LiveFeedShowcase from '../components/landing/LiveFeedShowcase'
import AIFeaturesShowcase from '../components/landing/AIFeaturesShowcase'
import StatsBand from '../components/landing/StatsBand'
import Testimonials from '../components/landing/Testimonials'
import CTASection from '../components/landing/CTASection'
import LandingFooter from '../components/landing/LandingFooter'
import ScrollRevealer from '../components/landing/ScrollRevealer'

export default function LandingPage() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-stone-50 text-[#44403C] flex flex-col font-sans antialiased selection:bg-blue-150 selection:text-blue-900 overflow-x-hidden">
      <LandingNavbar />
      <ScrollRevealer isFirst>
        <Hero />
      </ScrollRevealer>
      <ScrollRevealer>
        <TrustTicker />
      </ScrollRevealer>
      <ScrollRevealer>
        <SocialFeedShowcase />
      </ScrollRevealer>
      <ScrollRevealer>
        <AIFeaturesShowcase />
      </ScrollRevealer>
      <ScrollRevealer>
        <JourneySteps />
      </ScrollRevealer>
      <ScrollRevealer>
        <FeatureGrid />
      </ScrollRevealer>
      <ScrollRevealer>
        <LiveFeedShowcase />
      </ScrollRevealer>
      <ScrollRevealer>
        <StatsBand />
      </ScrollRevealer>
      <ScrollRevealer>
        <Testimonials />
      </ScrollRevealer>
      <ScrollRevealer isLast>
        <CTASection />
      </ScrollRevealer>
      <LandingFooter />

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="back-to-top"
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-3.5 rounded-full bg-white border border-stone-250 shadow-[0_8px_30px_rgb(28,25,23,0.08)] hover:shadow-[0_8px_30px_rgb(28,25,23,0.14)] text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-all focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 flex items-center justify-center"
            title="Scroll to top"
          >
            <ArrowUp size={16} className="stroke-[2.5]" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
