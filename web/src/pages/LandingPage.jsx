import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  MapPin, MessageSquare, ShieldAlert, Calendar, 
  Store, Users, LogIn, ArrowRight, ShieldCheck, Heart 
} from 'lucide-react'
import { selectIsAuthenticated } from '../redux/slices/authSlice'

export default function LandingPage() {
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  return (
    <div className="min-h-screen bg-stone-50 text-stone-700 flex flex-col font-sans">
      
      {/* ─── Header / Navbar ─── */}
      <header className="sticky top-0 z-50 bg-white border-b border-stone-250/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
              N
            </div>
            <span className="text-base font-bold tracking-tight text-stone-800">
              Neighbour<span className="text-primary-600">Hub</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/feed')}
                className="btn-primary py-2 px-4 text-xs font-semibold shadow-sm flex items-center gap-1"
              >
                Go to Feed <ArrowRight size={13} />
              </button>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="px-3 py-2 rounded-lg text-stone-600 hover:text-stone-900 font-semibold text-xs transition-all flex items-center gap-1"
                >
                  <LogIn size={13} /> Log In
                </Link>
                <Link 
                  to="/register"
                  className="btn-primary py-2 px-4 text-xs font-semibold shadow-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-16 pb-12 px-6 max-w-5xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-[10px] font-bold text-stone-650 mb-6 select-none">
          <MapPin size={11} className="text-primary-500" />
          <span>Hyperlocal Neighborhood Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl text-stone-850">
          Connect with Your Local <br />
          <span className="text-primary-650">Community Instantly</span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-stone-500 max-w-xl leading-relaxed">
          The all-in-one verified platform designed to connect you with nearby neighbors, emergency alerts, active community events, marketplace directories, and custom-scoped discussions.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 justify-center items-center">
          {isAuthenticated ? (
            <button 
              onClick={() => navigate('/feed')}
              className="btn-primary py-3 px-6 text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              Enter Application <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <Link 
                to="/register"
                className="btn-primary py-3 px-6 text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                Join Your Neighborhood <ArrowRight size={14} />
              </Link>
              <Link 
                to="/login"
                className="btn-secondary py-3 px-6 text-xs font-bold shadow-sm"
              >
                Explore Login
              </Link>
            </>
          )}
        </div>

        {/* Mock App Feed Preview Block */}
        <div className="mt-14 w-full max-w-3xl card p-1 bg-stone-100/40 select-none">
          <div className="bg-white rounded-lg border border-stone-200/80 p-5 flex flex-col gap-3.5 text-left shadow-sm">
            <div className="flex gap-2.5 items-center">
              <div className="w-9 h-9 rounded-full bg-stone-150 flex items-center justify-center font-bold text-stone-600 text-xs border border-stone-200">
                JD
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  John Doe <span className="px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 text-[9px] border border-primary-100 font-bold">Verified Admin</span>
                </h4>
                <p className="text-[10px] text-stone-400 font-medium">Bandra West Neighborhood • 5 mins ago</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="px-2 py-0.5 rounded bg-red-50 border border-red-100 text-red-650 font-bold text-[9px] uppercase tracking-wider">
                Emergency Alert
              </span>
              <h3 className="text-xs sm:text-sm font-extrabold text-stone-850">Water Supply Maintenance Scheduled for Tuesday</h3>
              <p className="text-xs text-stone-500 leading-relaxed max-w-xl">
                Please store enough water for Tuesday, July 7th. BMC will be performing pipeline repairs from 9 AM to 6 PM. All societies in the Garden City area will have zero supply during this period.
              </p>
            </div>
            <div className="flex items-center gap-3 text-stone-400 border-t border-stone-100 pt-3 text-[10px] font-bold">
              <span className="flex items-center gap-1"><Users size={11} className="text-stone-450" /> 42 neighbors read</span>
              <span className="flex items-center gap-1"><MessageSquare size={11} className="text-stone-450" /> 12 comments</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="bg-white py-16 px-6 border-t border-stone-200/60 shadow-inner">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-extrabold text-stone-850 tracking-tight">
              Platform Features
            </h2>
            <p className="mt-2.5 text-xs sm:text-sm text-stone-500 leading-relaxed">
              Explore how NeighbourHub connects you with key utilities, community members, and immediate local notices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: MapPin,
                color: 'text-primary-600 bg-primary-50 border-primary-100',
                title: 'Distance-Based Scoping',
                desc: 'Target posts dynamically! Choose to spread your notices within 5 km, 10 km, or to the entire city, state, or country level.'
              },
              {
                icon: ShieldAlert,
                color: 'text-red-600 bg-red-50 border-red-100',
                title: 'Verified Emergency Alerts',
                desc: 'Admins and moderators can post critical emergency alerts that pin to the top of the feed and send instant notification flags.'
              },
              {
                icon: Calendar,
                color: 'text-green-600 bg-green-50 border-green-100',
                title: 'Community Events',
                desc: 'Plan physical neighborhood events, set maximum attendee limits, track RSVP checklists, and list coordinates/venues.'
              },
              {
                icon: Store,
                color: 'text-amber-600 bg-amber-50 border-amber-100',
                title: 'Business Directory',
                desc: 'Showcase local stores, services, and community listings to gain nearby visibility, exclusively for registered business accounts.'
              },
              {
                icon: Users,
                color: 'text-indigo-650 bg-indigo-50 border-indigo-100',
                title: 'Verified Neighborhoods',
                desc: 'Automatically connects you to your exact local society or neighborhood based on GPS coordinates resolved during registration.'
              },
              {
                icon: MessageSquare,
                color: 'text-purple-650 bg-purple-50 border-purple-100',
                title: 'Consensus Polls',
                desc: 'Resolve neighborhood decisions instantly. Create polls with support for anonymous and public voting configurations.'
              }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="p-5 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50/90 transition-all flex flex-col gap-3 text-left"
              >
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${feature.color}`}>
                  <feature.icon size={16} />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-850">
                  {feature.title}
                </h3>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── Security Row ─── */}
      <section className="py-16 px-6 max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="max-w-md text-left space-y-3.5">
          <div className="w-9 h-9 rounded-lg bg-primary-50 border border-primary-100 text-primary-650 flex items-center justify-center shadow-sm">
            <ShieldCheck size={18} />
          </div>
          <h2 className="text-2xl font-extrabold text-stone-850 tracking-tight leading-tight">
            Safety & Verification <br /> Are Our Priorities
          </h2>
          <p className="text-xs sm:text-xs text-stone-500 leading-relaxed">
            Every user account belongs to a verified email address. Registration verification ensures that trolls cannot abuse the platform, keeping the localized neighborhood feeds secure and constructive.
          </p>
        </div>
        <div className="w-full max-w-sm bg-white border border-stone-200 p-5 rounded-xl flex flex-col gap-3.5 text-left shadow-sm">
          <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">How to join:</h4>
          {[
            { step: '1', title: 'Fill Registration', desc: 'Enter your name, email, credentials, and select your location.' },
            { step: '2', title: 'Verify Email', desc: 'Enter the OTP code received in your email inbox.' },
            { step: '3', title: 'Start Exploring', desc: 'Read community posts, check local events, and write scoped notices.' }
          ].map((item, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-[10px] font-bold text-stone-600 flex-shrink-0">
                {item.step}
              </div>
              <div>
                <h5 className="text-xs font-bold text-stone-800">{item.title}</h5>
                <p className="text-[10px] text-stone-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="mt-auto bg-white border-t border-stone-200/80 py-8 px-6 text-center text-stone-400 shadow-inner">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 text-[11px] font-semibold">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary-650 flex items-center justify-center text-white font-extrabold text-xs">
              N
            </div>
            <span className="font-bold text-stone-700">
              NeighbourHub &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex gap-3.5">
            <a href="#" className="hover:text-stone-650 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-stone-650 transition-colors">Terms of Service</a>
            <span className="flex items-center gap-1 text-[10px] text-stone-400">
              Made with <Heart size={9} className="text-red-500" /> for community safety
            </span>
          </div>
        </div>
      </footer>

    </div>
  )
}
