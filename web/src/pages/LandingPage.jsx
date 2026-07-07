import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  MapPin, ShieldAlert, Calendar, Store, Users, 
  ArrowRight, ShieldCheck, Heart, MessageSquare 
} from 'lucide-react'
import { selectIsAuthenticated } from '../redux/slices/authSlice'

export default function LandingPage(){
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#44403C] flex flex-col font-sans antialiased selection:bg-blue-150 selection:text-blue-900">
      
      {/* ─── Header / Navbar (Wide Layout) ─── */}
      <header className="sticky top-0 z-50 bg-[#FAFAF9]/80 backdrop-blur-md border-b border-[#E7E5E4] w-full">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => navigate('/')}>
            <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
              N
            </div>
            <span className="text-base font-extrabold tracking-tight text-[#1C1917]">
              Neighbour<span className="text-[#2563EB]">Hub</span>
            </span>
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
                  className="text-xs font-bold text-[#78716C] hover:text-[#1C1917] transition-colors duration-150"
                >
                  Log In
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
      </header>

      {/* ─── Hero Section (Two-Column Split: starts near left, ends near right) ─── */}
      <section className="relative w-full border-b border-[#E7E5E4] pt-8 md:pt-12 pb-16 md:pb-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Core pitch (55% width) */}
          <div className="lg:col-span-7 space-y-7 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-[#E7E5E4] text-[10px] font-bold text-[#78716C] uppercase tracking-widest select-none">
              <MapPin size={11} className="text-[#2563EB]" />
              <span>For Indian Neighborhoods</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-[54px] font-extrabold tracking-tight text-[#1C1917] leading-[1.05] max-w-2xl">
              Connect with your <br />
              neighborhood <br />
              <span className="text-[#2563EB] relative inline-block">
                in real time.
                <span className="absolute bottom-1 left-0 w-full h-[3px] bg-[#2563EB]/10 rounded" />
              </span>
            </h1>

            <p className="text-[16px] md:text-[17px] text-[#78716C] leading-relaxed max-w-xl font-medium">
              A private, verified platform designed for Indian residential societies. Stay informed about local RWA announcements, nearby events, emergency broadcasts, and trusted local businesses.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              {isAuthenticated ? (
                <button 
                  onClick={() => navigate('/feed')}
                  className="btn-primary py-3.5 px-7 text-sm font-extrabold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  Enter Application <ArrowRight size={15} className="ml-1" />
                </button>
              ) : (
                <>
                  <Link 
                    to="/register"
                    className="btn-primary py-3.5 px-7 text-sm font-extrabold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Join Your Neighborhood <ArrowRight size={15} className="ml-1" />
                  </Link>
                  <Link 
                    to="/login"
                    className="btn-secondary py-3.5 px-7 text-sm font-extrabold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-[12px] text-[#78716C] font-semibold pt-2">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Verified email address & neighborhood boundaries required.</span>
            </div>

            {/* Hyperlocal Directory Statistics Card (Notion-inspired) */}
            <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-[0_2px_8px_-1px_rgba(0,0,0,0.03),0_8px_16px_-4px_rgba(0,0,0,0.015)] max-w-lg mt-6 text-left space-y-4">
              <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2.5">
                Live Neighborhood Activity (Bandra West)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <p className="text-xl font-extrabold text-[#1C1917]">482</p>
                  <p className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider">Residents Joined</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xl font-extrabold text-[#2563EB]">18</p>
                  <p className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider">Local Businesses</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xl font-extrabold text-emerald-600">8</p>
                  <p className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider">Active RWA Members</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xl font-extrabold text-[#F59E0B]">4</p>
                  <p className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider">Ongoing Events</p>
                </div>
              </div>
              
              <div className="divider my-0 border-t border-stone-100" />
              
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  Recent Activities
                </p>
                <div className="space-y-2">
                  {[
                    { text: 'RWA President Rajesh Chawla posted a notice', time: '2h ago' },
                    { text: 'Oven Fresh Bakery added a new discount code', time: '3h ago' },
                    { text: 'Green Earth Club scheduled a plantation drive', time: '5h ago' }
                  ].map((act, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-[#44403C] font-semibold">
                      <span className="truncate pr-4">• {act.text}</span>
                      <span className="text-[10px] text-stone-400 flex-shrink-0">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Styled HTML Feed Preview (45% width - ends near right edge) */}
          <div className="lg:col-span-5 flex flex-col gap-5 select-none w-full">
            
            {/* Post 1: Emergency Notice (Red) */}
            <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-[0_2px_8px_-1px_rgba(0,0,0,0.03),0_8px_16px_-4px_rgba(0,0,0,0.015)] text-left hover:border-red-200 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] hover:-translate-y-0.5">
              <div className="flex gap-2.5 items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-[#78716C] text-[10px] border border-[#E7E5E4] shadow-sm">
                  RC
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                    Rajesh Chawla
                    <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 text-[8px] font-bold border border-red-100 uppercase tracking-wide">RWA President</span>
                  </h4>
                  <p className="text-[10px] text-[#78716C] font-medium">Bandra West • 2 hrs ago</p>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-[#1C1917] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Water Pipeline Maintenance Tomorrow
                </h3>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Water supply will be suspended tomorrow (Tuesday) from 9:00 AM to 4:00 PM for repair works. Please store adequate water.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-6 text-stone-400 text-xs font-bold">
                <span className="flex items-center gap-1.5 hover:text-red-500 transition-colors"><Heart size={14} /> 42</span>
                <span className="flex items-center gap-1.5 hover:text-stone-700 transition-colors"><MessageSquare size={14} /> 12</span>
              </div>
            </div>

            {/* Post 2: Local Business Showcase (Amber) */}
            <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-[0_2px_8px_-1px_rgba(0,0,0,0.03),0_8px_16px_-4px_rgba(0,0,0,0.015)] text-left hover:border-amber-250 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#F59E0B]" />
              <div className="flex gap-2.5 items-center mb-3 pl-1">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center font-bold text-[#F59E0B] text-[10px] border border-amber-100 shadow-sm">
                  OB
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                    Oven Fresh Bakery
                    <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[8px] font-bold border border-amber-100 uppercase tracking-wide">Local Business</span>
                  </h4>
                  <p className="text-[10px] text-[#78716C] font-medium">0.3 km away • Active Now</p>
                </div>
              </div>
              <div className="space-y-2.5 pl-1">
                <h3 className="text-sm font-extrabold text-[#1C1917]">Fresh Sourdough & Chai Spiced Loaves</h3>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Hey neighbors! Fresh batch is out of the oven. Mention <span className="font-bold text-[#F59E0B]">NEIGHBOUR15</span> for 15% off at the counter.
                </p>
                
                {/* Generated bakery image display */}
                <div className="mt-3 overflow-hidden rounded-xl border border-stone-200/60 max-h-48 w-full bg-stone-50/50 flex justify-center items-center">
                  <img 
                    src="/fresh_bakery_preview.png" 
                    alt="Fresh bakery items" 
                    className="w-full object-cover max-h-48 aspect-video"
                  />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 pl-1 flex items-center gap-6 text-stone-400 text-xs font-bold">
                <span className="flex items-center gap-1.5 hover:text-red-500 transition-colors"><Heart size={14} /> 65</span>
                <span className="flex items-center gap-1.5 hover:text-stone-700 transition-colors"><MessageSquare size={14} /> 8</span>
              </div>
            </div>

            {/* Post 3: Community Event (Emerald) */}
            <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-[0_2px_8px_-1px_rgba(0,0,0,0.03),0_8px_16px_-4px_rgba(0,0,0,0.015)] text-left hover:border-emerald-200 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] hover:-translate-y-0.5">
              <div className="flex gap-2.5 items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-[#78716C] text-[10px] border border-[#E7E5E4] shadow-sm">
                  PS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                    Priya Sharma
                  </h4>
                  <p className="text-[10px] text-[#78716C] font-medium">Bandra West • 5 hrs ago</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[8px] font-bold border border-emerald-100 uppercase tracking-wide">
                    RSVP Event
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50/50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    18 attending
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-[#1C1917]">Sunday Society Clean-Up & Tree Plantation</h3>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Join us this Sunday at 8 AM in the East Lawn. Saplings and tools will be provided. Light breakfast afterwards!
                </p>
                
                {/* Generated event image display */}
                <div className="mt-3 overflow-hidden rounded-xl border border-stone-200/60 max-h-48 w-full bg-stone-50/50 flex justify-center items-center">
                  <img 
                    src="/gardening_event_preview.png" 
                    alt="Gardening drive" 
                    className="w-full object-cover max-h-48 aspect-video"
                  />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-6 text-stone-400 text-xs font-bold">
                <span className="flex items-center gap-1.5 hover:text-red-500 transition-colors"><Heart size={14} /> 28</span>
                <span className="flex items-center gap-1.5 hover:text-stone-700 transition-colors"><MessageSquare size={14} /> 14</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Product Pillars (Notion-inspired Grid - Wide Layout) ─── */}
      <section className="bg-white py-24 px-6 border-b border-[#E7E5E4] w-full">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
          
          <div className="text-left max-w-2xl mb-16">
            <h2 className="text-3xl font-extrabold text-[#1C1917] tracking-tight">
              Built for real local needs
            </h2>
            <p className="mt-3 text-[15px] text-[#78716C] leading-relaxed font-medium">
              No global noise, no algorithms. Just the utility, notices, and interactions that shape your immediate surroundings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1: Scoped Feed */}
            <div className="p-6 border border-[#E7E5E4] rounded-2xl bg-[#FAFAF9] flex flex-col justify-between text-left min-h-[180px] shadow-sm hover:shadow-md transition-all duration-300">
              <div>
                <MapPin size={18} className="text-[#2563EB] mb-4" />
                <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-widest mb-1.5">
                  Location Scoping
                </h3>
                <p className="text-xs text-[#78716C] leading-relaxed font-medium">
                  Choose the radius of your posts. Keep it inside your society gates, or spread it to nearby blocks.
                </p>
              </div>
            </div>

            {/* Feature 2: Emergency Alerts */}
            <div className="p-6 border border-[#E7E5E4] rounded-2xl bg-[#FAFAF9] flex flex-col justify-between text-left min-h-[180px] shadow-sm hover:shadow-md transition-all duration-300">
              <div>
                <ShieldCheck size={18} className="text-red-500 mb-4" />
                <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-widest mb-1.5">
                  RWA Verification
                </h3>
                <p className="text-xs text-[#78716C] leading-relaxed font-medium">
                  Verified administrators publish emergency notices that bypass standard feeds to grab immediate attention.
                </p>
              </div>
            </div>

            {/* Feature 3: Community Events */}
            <div className="p-6 border border-[#E7E5E4] rounded-2xl bg-[#FAFAF9] flex flex-col justify-between text-left min-h-[180px] shadow-sm hover:shadow-md transition-all duration-300">
              <div>
                <Calendar size={18} className="text-emerald-600 mb-4" />
                <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-widest mb-1.5">
                  Society Events
                </h3>
                <p className="text-xs text-[#78716C] leading-relaxed font-medium">
                  Create clean meetups, handle attendee lists, and coordinate local neighborhood initiatives.
                </p>
              </div>
            </div>

            {/* Feature 4: Local Businesses (Amber - #F59E0B) */}
            <div className="p-6 border border-[#E7E5E4] rounded-2xl bg-[#FAFAF9] flex flex-col justify-between text-left min-h-[180px] shadow-sm hover:shadow-md transition-all duration-300 border-l-2 border-l-[#F59E0B]">
              <div>
                <Store size={18} className="text-[#F59E0B] mb-4" />
                <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-widest mb-1.5">
                  Business Directory
                </h3>
                <p className="text-xs text-[#78716C] leading-relaxed font-medium">
                  Support local vendors, home-bakers, and nearby service providers, highlighting direct community deals.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── Call to Action (Single Job: Sign Up) ─── */}
      <section className="bg-[#FAFAF9] py-24 px-6 text-center w-full">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1C1917] tracking-tight">
            Ready to join your neighbors?
          </h2>
          <p className="text-[15px] text-[#78716C] leading-relaxed max-w-md mx-auto font-medium">
            Sign up takes less than 2 minutes. Enter your society location, verify your email, and instantly connect to your local feed.
          </p>
          <div className="pt-3">
            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/feed')}
                className="btn-primary py-3.5 px-8 text-sm font-bold shadow-md hover:shadow-lg"
              >
                Go to Feed Layout <ArrowRight size={14} className="ml-1" />
              </button>
            ) : (
              <Link 
                to="/register"
                className="btn-primary py-3.5 px-8 text-sm font-bold shadow-md hover:shadow-lg"
              >
                Create Your Free Account <ArrowRight size={14} className="ml-1" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ─── Footer (Wide Layout) ─── */}
      <footer className="mt-auto bg-[#FAFAF9] border-t border-[#E7E5E4] py-10 px-6 text-center text-[#78716C] w-full">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-5 text-xs font-semibold">
          <div className="flex items-center gap-2 select-none">
            <div className="w-6 h-6 rounded-md bg-[#2563EB] flex items-center justify-center text-white font-extrabold text-[11px] shadow-sm">
              N
            </div>
            <span className="font-bold text-[#1C1917]">
              NeighbourHub &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex gap-4.5">
            <a href="#" className="hover:text-[#1C1917] transition-colors duration-150">Privacy Policy</a>
            <a href="#" className="hover:text-[#1C1917] transition-colors duration-150">Terms of Service</a>
            <span className="flex items-center gap-1.5 text-[11px] text-[#78716C]">
              Made with <Heart size={11} className="text-red-500 fill-red-500" /> for community safety
            </span>
          </div>
        </div>
      </footer>

    </div>
  )
}
