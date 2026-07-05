// Main feed page - infinite scroll, type filter pills, create post composer

import { useEffect, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export default function FeedPage() {
  const bottomRef = useRef(null)

  // Initial feed load - refetches when active location changes
  useEffect(() => {
    dispatch(fetchFeed({ limit: 20 }))
  }, [dispatch, activeLocation?.id])

  // IntersectionObserver drives infinite scroll -
  // when the invisible div at the bottom enters the viewport,
  // dispatch fetchFeed with the cursor from the last batch
  const handleObserver = useCallback((entries) => {
    const [entry] = entries
    if (entry.isIntersecting && hasMore && !isLoadingMore) {
      dispatch(fetchFeed({ limit: 20, before: nextCursor }))
    }
  }, [hasMore, isLoadingMore, nextCursor])

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 })
    if (bottomRef.current) observer.observe(bottomRef.current)
    return () => observer.disconnect()
  }, [handleObserver])

  // Client-side type filtering of the already-loaded posts
  const filteredPosts = feedFilter === 'all'
    ? posts
    : posts.filter((p) => p.type === feedFilter)

  return (
    <div className="max-w-feed mx-auto w-full">
      {/* Create post composer (collapsed → expanded) */}
      {/* Filter pills */}
      {/* Post cards with skeletons */}
      {/* Invisible div for IntersectionObserver */}
      <div ref={bottomRef} className="h-1" />
    </div>
  )
}