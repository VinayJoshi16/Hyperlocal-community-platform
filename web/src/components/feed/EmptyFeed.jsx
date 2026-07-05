const EMPTY_CONFIG = {
  all:          { icon: Home,          title: 'Your feed is quiet',    cta: 'Create the first post' },
  announcement: { icon: Megaphone,     title: 'No announcements yet',  cta: 'Post an announcement' },
  event:        { icon: Calendar,      title: 'No events planned',     cta: 'Create an event' },
  lost_found:   { icon: Search,        title: 'Nothing lost or found', cta: 'Post lost & found' },
  business:     { icon: Briefcase,     title: 'No local businesses',   cta: null },
  poll:         { icon: BarChart2,     title: 'No polls active',       cta: 'Create a poll' },
  emergency:    { icon: AlertTriangle, title: 'No active alerts',      cta: null },
}

export default function EmptyFeed({ filter = 'all' }) {
  const config = EMPTY_CONFIG[filter] || EMPTY_CONFIG.all

  return (
    <div className="card py-14 px-6 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
        <config.icon size={24} className="text-stone-400" />
      </div>
      <h3 className="text-base font-semibold text-stone-700 mb-1.5">{config.title}</h3>
      <p className="text-sm text-stone-400 leading-relaxed max-w-xs">{config.message}</p>
      {config.cta && (
        <button onClick={handleCta} className="btn-secondary mt-5 gap-2">
          <Plus size={15} /> {config.cta}
        </button>
      )}
    </div>
  )
}