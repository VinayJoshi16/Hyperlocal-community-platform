import {
  Home, Megaphone, Calendar, Search,
  Briefcase, BarChart2, AlertTriangle,
} from 'lucide-react'

const FILTERS = [
  { type: 'all',          label: 'All',          icon: Home },
  { type: 'announcement', label: 'Updates',      icon: Megaphone },
  { type: 'event',        label: 'Events',       icon: Calendar },
  { type: 'lost_found',   label: 'Lost & Found', icon: Search },
  { type: 'business',     label: 'Business',     icon: Briefcase },
  { type: 'poll',         label: 'Polls',        icon: BarChart2 },
  { type: 'emergency',    label: 'Emergency',    icon: AlertTriangle },
]

export default function FilterPills({ active, onChange, className = '' }) {
  return (
    <div className={`overflow-x-auto scrollbar-hide -mx-4 px-4 ${className}`}>
      <div className="flex items-center gap-1.5 w-max pb-1 select-none">
        {FILTERS.map(({ type, label, icon: Icon }) => {
          const isActive = active === type
          return (
            <button
              key={type}
              onClick={() => onChange(type)}
              className={`flex items-center gap-2 px-3.5 py-1.8 rounded-lg
                          text-xs font-semibold whitespace-nowrap border transition-all duration-150
                          ${isActive
                            ? 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/25 font-bold shadow-sm'
                            : 'bg-white text-stone-600 border-stone-200/80 hover:border-stone-300 hover:bg-stone-50/50'
                          }
                          ${type === 'emergency' && !isActive
                            ? 'text-red-600 border-red-200 hover:border-red-300'
                            : ''}`}
            >
              <Icon size={14} className={isActive ? 'text-[#2563EB]' : 'text-stone-400'} />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}