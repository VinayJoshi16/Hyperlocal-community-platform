// Main feed page - infinite scroll, type filter pills, create post composer

import { useState, useEffect, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AlertTriangle, X, Loader2 } from 'lucide-react'

import { 
  fetchFeed, selectPosts, selectFeedLoading, 
  selectLoadingMore, selectHasMore, selectNextCursor, 
  selectEmergencyAlert, dismissEmergencyAlert, clearFeed
} from '../redux/slices/feedSlice'
import { selectActiveLocation } from '../redux/slices/locationSlice'
import { selectFeedFilter, setFeedFilter } from '../redux/slices/uiSlice'

import CreatePostForm from '../components/feed/CreatePostForm'
import FilterPills from '../components/feed/FilterPills'
import PostCard from '../components/feed/PostCard'
import PostSkeleton from '../components/feed/PostSkeleton'
import EmptyFeed from '../components/feed/EmptyFeed'

export default function FeedPage() {
  const dispatch = useDispatch()
  const bottomRef = useRef(null)

  const [coords, setCoords] = useState(null)

  // Query user coordinates on mount for dynamic distance feed queries
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        () => {}
      )
    }
  }, [])

  const posts = useSelector(selectPosts)
  const isLoading = useSelector(selectFeedLoading)
  const isLoadingMore = useSelector(selectLoadingMore)
  const hasMore = useSelector(selectHasMore)
  const nextCursor = useSelector(selectNextCursor)
  const emergencyAlert = useSelector(selectEmergencyAlert)
  const activeLocation = useSelector(selectActiveLocation)
  const feedFilter = useSelector(selectFeedFilter)

  // Clear feed and load initial feed when active location changes
  useEffect(() => {
    dispatch(clearFeed())
    if (activeLocation?.id) {
      dispatch(fetchFeed({ limit: 20, lat: coords?.lat, lng: coords?.lng }))
    }
  }, [dispatch, activeLocation?.id, coords])

  // IntersectionObserver drives infinite scroll
  const handleObserver = useCallback((entries) => {
    const [entry] = entries
    if (entry.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
      dispatch(fetchFeed({ limit: 20, before: nextCursor, lat: coords?.lat, lng: coords?.lng }))
    }
  }, [dispatch, hasMore, isLoadingMore, isLoading, nextCursor, coords])

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
    <div className="max-w-feed mx-auto w-full px-4 py-6">
      {/* Emergency alert banner */}
      {emergencyAlert && (
        <div className="emergency-banner rounded-xl mb-6 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="animate-pulse text-white flex-shrink-0" />
            <p className="text-sm font-medium leading-relaxed">
              <span className="font-bold uppercase mr-1">Alert:</span>
              {emergencyAlert}
            </p>
          </div>
          <button 
            onClick={() => dispatch(dismissEmergencyAlert())}
            className="text-white hover:bg-red-700/50 p-1.5 rounded-full transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Create post composer (collapsed → expanded) */}
      <CreatePostForm />

      {/* Filter pills */}
      <FilterPills 
        active={feedFilter} 
        onChange={(type) => dispatch(setFeedFilter(type))} 
        className="mb-6"
      />

      {/* Feed list with skeletons */}
      <div className="space-y-4">
        {isLoading && filteredPosts.length === 0 ? (
          /* Render initial loading skeletons */
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : filteredPosts.length === 0 ? (
          /* Render empty feed message */
          <EmptyFeed filter={feedFilter} />
        ) : (
          /* Render list of post cards */
          filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}

        {/* Loading more spinner */}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-stone-400" size={24} />
          </div>
        )}
      </div>

      {/* Invisible div for IntersectionObserver */}
      <div ref={bottomRef} className="h-4 w-full" />
    </div>
  )
}