import { AlertTriangle, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function EmergencyBanner({ post, onDismiss }) {
  if (!post) return null

  return (
    <div className="bg-red-600 text-white px-4 py-3 animate-fadeIn">
      <div className="max-w-app mx-auto flex items-start gap-3">

        {/* Icon */}
        <AlertTriangle size={18} className="text-red-200 flex-shrink-0 mt-0.5" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider
                             bg-red-500 px-2 py-0.5 rounded-full text-red-100">
              Emergency Alert
            </span>
            <span className="text-xs text-red-200">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>

          {post.title && (
            <p className="text-sm font-semibold mt-1 leading-snug">{post.title}</p>
          )}
          <p className="text-sm text-red-100 mt-0.5 line-clamp-2">{post.body}</p>

          {post.location_name && (
            <p className="text-xs text-red-200 mt-1">📍 {post.location_name}</p>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 hover:bg-red-500 rounded-lg transition-colors"
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>

      </div>
    </div>
  )
}