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
    <div className="flex w-full gap-8 items-start">
      
      {/* Main Feed Column */}
      <div className="flex-1 min-w-0">
        {/* Emergency alert banner */}
        {emergencyAlert && (
          <div className="emergency-banner rounded-2xl mb-6 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="animate-pulse text-white flex-shrink-0" />
              <p className="text-sm font-semibold leading-relaxed">
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

        {/* Create post composer */}
        <CreatePostForm />

        {/* Filter pills */}
        <FilterPills 
          active={feedFilter} 
          onChange={(type) => dispatch(setFeedFilter(type))} 
          className="mb-6"
        />

        {/* Feed list with skeletons */}
        <div className="space-y-5">
          {isLoading && filteredPosts.length === 0 ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : filteredPosts.length === 0 ? (
            <EmptyFeed filter={feedFilter} />
          ) : (
            filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}

          {isLoadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-stone-400" size={24} />
            </div>
          )}
        </div>

        {/* Invisible div for IntersectionObserver */}
        <div ref={bottomRef} className="h-4 w-full" />
      </div>

      {/* Right Sidebar - desktop only */}
      <aside className="hidden xl:flex flex-col gap-6 w-80 flex-shrink-0 sticky top-[80px]">
        {/* Emergency Contacts card */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-left">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
            Emergency Hotlines
          </h3>
          <div className="space-y-3.5">
            {[
              { label: 'Security Guard Gate', phone: '+91 98765 43210' },
              { label: 'RWA Management Office', phone: '022-2640-1234' },
              { label: 'Water Supply Department', phone: '1916' },
              { label: 'Local Police Station', phone: '100' },
              { label: 'Fire & Rescue Services', phone: '101' }
            ].map((contact, idx) => (
              <div key={idx} className="flex flex-col border-b border-stone-100 pb-2.5 last:border-0 last:pb-0">
                <span className="text-[11px] font-bold text-[#1C1917]">{contact.label}</span>
                <a href={`tel:${contact.phone}`} className="text-xs font-bold text-primary-650 hover:text-primary-750 mt-0.5 inline-flex items-center gap-1 transition-colors">
                  {contact.phone}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Guidelines card */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-left">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
            Society Guidelines
          </h3>
          <ul className="space-y-2.5 text-xs text-stone-550 list-disc list-inside font-medium leading-relaxed">
            <li>Keep public corridors clear of personal items.</li>
            <li>Maintain quiet hours between 10:00 PM – 7:00 AM.</li>
            <li>Ensure guest vehicles are registered at the main gate.</li>
            <li>Segregate wet and dry garbage before disposal.</li>
          </ul>
        </div>
      </aside>

    </div>
  );
}