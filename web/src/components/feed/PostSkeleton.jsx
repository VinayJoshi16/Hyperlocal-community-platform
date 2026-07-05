// Skeleton placeholder - matches PostCard layout exactly so the page
// doesn't shift when real posts arrive.

export default function PostSkeleton() {
  return (
    <div className="card p-4 animate-pulse">

      {/* Header: avatar + name + badge */}
      <div className="flex items-start gap-3">
        <div className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="skeleton h-3.5 w-28 rounded" />
            <div className="skeleton h-3.5 w-16 rounded-full" />
          </div>
          <div className="skeleton h-3 w-20 rounded" />
        </div>
        <div className="skeleton w-6 h-6 rounded flex-shrink-0" />
      </div>

      {/* Body lines */}
      <div className="mt-3 pl-12 flex flex-col gap-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3.5 w-full rounded" />
        <div className="skeleton h-3.5 w-5/6 rounded" />
        <div className="skeleton h-3.5 w-2/3 rounded" />
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 pl-12 border-t border-stone-100 flex gap-4">
        <div className="skeleton h-4 w-10 rounded" />
        <div className="skeleton h-4 w-10 rounded" />
      </div>

    </div>
  )
}