import { useDispatch } from 'react-redux'
import {
  Home, Megaphone, Calendar, Search,
  Briefcase, BarChart2, AlertTriangle, Plus
} from 'lucide-react'
import { setCreatePostOpen } from '../../redux/slices/uiSlice'

const EMPTY_CONFIG = {
  all:          { icon: Home,          title: 'Your feed is quiet',    message: 'Check back later or share something with your neighborhood.', cta: 'Create the first post' },
  announcement: { icon: Megaphone,     title: 'No announcements yet',  message: 'Important neighborhood updates will appear here.', cta: 'Post an announcement' },
  event:        { icon: Calendar,      title: 'No events planned',     message: 'No upcoming block parties, cleanups, or events.', cta: 'Create an event' },
  lost_found:   { icon: Search,        title: 'Nothing lost or found', message: 'No reports of lost pets or found items.', cta: 'Post lost & found' },
  business:     { icon: Briefcase,     title: 'No local businesses',   message: 'Local business listings will be shown here.', cta: null },
  poll:         { icon: BarChart2,     title: 'No polls active',       message: 'No active neighborhood polls at the moment.', cta: 'Create a poll' },
  emergency:    { icon: AlertTriangle, title: 'No active alerts',      message: 'Urgent notices or emergency alerts.', cta: null },
}

export default function EmptyFeed({ filter = 'all' }) {
  const dispatch = useDispatch()
  const config = EMPTY_CONFIG[filter] || EMPTY_CONFIG.all

  function handleCta() {
    dispatch(setCreatePostOpen(true))
  }

  return (
    <div className="card py-14 px-6 flex flex-col items-center text-center bg-white border border-stone-200 rounded-xl shadow-card">
      <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4 text-stone-400">
        <config.icon size={24} />
      </div>
      <h3 className="text-base font-semibold text-stone-700 mb-1.5">{config.title}</h3>
      <p className="text-sm text-stone-400 leading-relaxed max-w-xs">{config.message}</p>
      {config.cta && (
        <button onClick={handleCta} className="btn-secondary mt-5 gap-2 flex items-center">
          <Plus size={15} /> {config.cta}
        </button>
      )}
    </div>
  )
}