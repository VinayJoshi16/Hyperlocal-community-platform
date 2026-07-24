import { Heart } from 'lucide-react'

export default function LandingFooter() {
  return (
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
  )
}
