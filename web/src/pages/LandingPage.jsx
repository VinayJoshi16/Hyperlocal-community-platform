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
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#44403C] flex flex-col font-sans antialiased selection:bg-blue-150 selection:text-blue-900 overflow-x-hidden">
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
    </div>
  )
}
