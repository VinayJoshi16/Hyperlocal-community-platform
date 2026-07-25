import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LandingFooter() {
  return (
    <footer className="bg-[#FAFAF9] border-t border-[#E7E5E4] pt-16 pb-12 px-6 w-full text-stone-600 font-sans">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
        {/* Brand column */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7.5 h-7.5 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-black text-[13px] shadow-sm select-none">
              N
            </div>
            <span className="font-black text-[#1C1917] tracking-tight text-sm">
              NeighbourHub
            </span>
          </div>
          <p className="text-[12px] text-[#78716C] leading-relaxed max-w-sm font-semibold">
            A secure, hyperlocal communication network designed to connect local residents, coordinate neighborhood activities, manage private community circles, and dispatch real-time emergency bulletins.
          </p>
        </div>

        {/* Product column */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="text-[10px] font-extrabold text-[#1C1917] uppercase tracking-widest">Navigation</h4>
          <ul className="space-y-2 text-[12px] font-semibold text-[#78716C]">
            <li>
              <Link to="/feed" className="hover:text-[#1C1917] transition-colors">Local Feed</Link>
            </li>
            <li>
              <Link to="/circles" className="hover:text-[#1C1917] transition-colors">Community Circles</Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-[#1C1917] transition-colors">Join Society</Link>
            </li>
          </ul>
        </div>

        {/* Legal/Support column */}
        <div className="md:col-span-4 space-y-3">
          <h4 className="text-[10px] font-extrabold text-[#1C1917] uppercase tracking-widest">Legal & Guidelines</h4>
          <ul className="space-y-2 text-[12px] font-semibold text-[#78716C]">
            <li>
              <a href="#" className="hover:text-[#1C1917] transition-colors">Privacy Policy</a>
            </li>
            <li>
              <a href="#" className="hover:text-[#1C1917] transition-colors">Terms of Service</a>
            </li>
            <li>
              <span className="flex items-center gap-1.5 hover:text-[#1C1917] transition-colors cursor-default select-none">
                Made with <Heart size={11} className="text-red-500 fill-red-500" /> for community safety
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1200px] mx-auto pt-8 border-t border-[#E7E5E4] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-semibold text-[#9C9A96]">
        <div>
          &copy; {new Date().getFullYear()} NeighbourHub. All rights reserved.
        </div>
        <div className="text-[10px] uppercase tracking-wider font-extrabold">
          Verified Neighborhood Network
        </div>
      </div>
    </footer>
  )
}
