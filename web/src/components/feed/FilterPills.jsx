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
  { type: 'emergency',    label: 'Alerts',       icon: AlertTriangle },
]

export default function FilterPills({ active, onChange, className = '' }) {
  return (
    <div className={`overflow-x-auto scrollbar-hide -mx-4 px-4 ${className}`}>
      <div className="flex items-center gap-2 w-max pb-1">
        {FILTERS.map(({ type, label, icon: Icon }) => {
          const isActive = active === type
          return (
            <button
              key={type}
              onClick={() => onChange(type)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full
                          text-sm font-medium whitespace-nowrap border transition-all
                          ${isActive
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                          }
                          ${type === 'emergency' && !isActive
                            ? 'text-red-500 border-red-200'
                            : ''}`}
            >
              <Icon size={13} />
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}