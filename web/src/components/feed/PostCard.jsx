// PostCard: one component handles all 7 post types.
// Each type shares the same header (avatar, author, badge, time)
// but gets type-specific content rendering below it.

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { 
  Heart, MessageCircle, Pin, Calendar, MapPin, 
  Users, Check, Clock, AlertTriangle, ArrowRight 
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

import { reactToPost } from '../../redux/slices/feedSlice'
import { postsAPI } from '../../services/api'

const TYPE_CONFIG = {
  announcement: { label: 'Update',       className: 'badge-stone' },
  notice:       { label: 'Notice',       className: 'badge-blue' },
  event:        { label: 'Event',        className: 'badge-green' },
  lost_found:   { label: 'Lost & Found', className: 'badge bg-purple-50 text-purple-700' },
  business:     { label: 'Business',     className: 'badge-amber' },
  poll:         { label: 'Poll',         className: 'badge bg-indigo-50 text-indigo-700' },
  emergency:    { label: 'Emergency',    className: 'badge-red' },
}

export default function PostCard({ post }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [postState, setPostState] = useState(post)

  // Keep local state in sync when prop updates
  useEffect(() => {
    setPostState(post)
  }, [post])

  const formatTime = (dateStr) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
    } catch (_) {
      return ''
    }
  };

  const handleLike = (e) => {
    e.stopPropagation()
    dispatch(reactToPost({ postId: post.id }))
  };

  const handleRsvp = async (e) => {
    e.stopPropagation()
    if (postState.event?.has_rsvped) return
    try {
      const res = await postsAPI.rsvp(post.id)
      if (res.status === 200 || res.status === 201) {
        setPostState(prev => ({
          ...prev,
          event: {
            ...prev.event,
            rsvp_count: (prev.event?.rsvp_count || 0) + 1,
            has_rsvped: true
          }
        }))
        toast.success('RSVP confirmed!')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to RSVP.')
    }
  };

  const handleVote = async (optionIndex, e) => {
    e.stopPropagation()
    if (postState.poll?.voted_option_index !== null) return
    try {
      const res = await postsAPI.vote(post.id, optionIndex)
      const updatedVotes = res.data.data.votes
      
      setPostState(prev => {
        const nextPoll = { ...prev.poll, voted_option_index: optionIndex }
        nextPoll.votes = updatedVotes
        return { ...prev, poll: nextPoll }
      })
      toast.success('Vote cast successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cast vote.')
    }
  };

  const typeConfig = TYPE_CONFIG[postState.type] || { label: 'Post', className: 'badge-stone' }
  const isEmergency = postState.type === 'emergency'

  // Poll percentage calculator helpers
  const getPollTotalVotes = () => {
    const votesArr = postState.poll?.votes || []
    return votesArr.reduce((sum, v) => sum + v.count, 0)
  };

  const getOptionPercentage = (index) => {
    const total = getPollTotalVotes()
    if (total === 0) return 0
    const votesArr = postState.poll?.votes || []
    const match = votesArr.find(v => v.option_index === index)
    return match ? Math.round((match.count / total) * 100) : 0
  };

  const getOptionCount = (index) => {
    const votesArr = postState.poll?.votes || []
    const match = votesArr.find(v => v.option_index === index)
    return match ? match.count : 0
  };

  return (
    <div 
      onClick={() => navigate(`/posts/${postState.id}`)}
      className={`card p-5 border cursor-pointer hover:border-stone-300 transition-all ${
        isEmergency 
          ? 'bg-red-50/50 border-red-200 hover:border-red-300 left-border-emergency' 
          : 'bg-white border-stone-200'
      }`}
    >
      {/* Pinned label */}
      {postState.is_pinned && (
        <div className="flex items-center gap-1 text-xs text-primary-600 font-semibold mb-2.5">
          <Pin size={12} className="rotate-45" />
          <span>Pinned by Admin</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {postState.author_avatar ? (
            <img 
              src={postState.author_avatar} 
              className="w-9 h-9 rounded-full object-cover border border-stone-100 flex-shrink-0"
              alt={postState.author_name} 
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {postState.author_name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-stone-800">{postState.author_name}</span>
              {postState.author_role && postState.author_role !== 'user' && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  postState.author_role === 'admin' 
                    ? 'bg-red-100 text-red-800' 
                    : postState.author_role === 'moderator'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {postState.author_role}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-0.5">
              <span>{formatTime(postState.created_at)}</span>
              <span>•</span>
              <span className="font-medium text-stone-500">{postState.location_name}</span>
            </div>
          </div>
        </div>

        {/* Post Type Badge */}
        <span className={`badge ${typeConfig.className} px-2.5 py-0.5 rounded-full text-xs font-semibold`}>
          {typeConfig.label}
        </span>
      </div>

      {/* Main post contents */}
      <div className="mt-4">
        {postState.title && (
          <h2 className="text-base font-bold text-stone-900 mb-1.5">
            {postState.title}
          </h2>
        )}
        <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap line-clamp-3">
          {postState.body}
        </p>
        {postState.media_urls && postState.media_urls.length > 0 && (
          <div className="mt-3 overflow-hidden rounded-xl border border-stone-200 max-h-72 bg-stone-50">
            <img 
              src={postState.media_urls[0]} 
              alt="Post Attachment" 
              className="w-full h-full object-cover max-h-72" 
            />
          </div>
        )}

        {/* Type specific: EVENTS details */}
        {postState.type === 'event' && postState.event && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="mt-4 p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3 cursor-default"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-green-600 flex-shrink-0" />
                <span className="font-medium">{new Date(postState.event.start_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
              {postState.event.venue && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-green-600 flex-shrink-0" />
                  <span className="truncate font-medium">{postState.event.venue}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-stone-200/60 pt-3">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                <Users size={14} />
                <span>{postState.event.rsvp_count || 0} attending</span>
              </div>
              <button
                onClick={handleRsvp}
                disabled={postState.event.has_rsvped}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  postState.event.has_rsvped
                    ? 'bg-green-550 bg-green-50 text-green-700 border border-green-200 cursor-default'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                }`}
              >
                {postState.event.has_rsvped ? (
                  <>
                    <Check size={12} /> Going
                  </>
                ) : (
                  'RSVP'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Type specific: POLLS details */}
        {postState.type === 'poll' && postState.poll && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="mt-4 p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3 cursor-default"
          >
            <div className="space-y-2.5">
              {postState.poll.options.map((opt, index) => {
                const votedForThis = postState.poll.voted_option_index === index
                const hasVoted = postState.poll.voted_option_index !== null
                const percent = getOptionPercentage(index)
                
                return (
                  <div key={index} className="relative">
                    {hasVoted ? (
                      /* Display Results mode */
                      <div className="flex items-center justify-between p-3 border border-stone-200 rounded-lg overflow-hidden relative bg-white text-xs">
                        {/* Progress Bar background */}
                        <div 
                          className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                            votedForThis ? 'bg-primary-50' : 'bg-stone-100'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                        
                        <div className="relative flex items-center gap-2 font-medium text-stone-700 max-w-[80%] truncate">
                          {votedForThis && <Check size={13} className="text-primary-600 flex-shrink-0" />}
                          <span className={votedForThis ? 'text-primary-700 font-bold' : ''}>
                            {opt.text}
                          </span>
                        </div>
                        <div className="relative text-xs font-bold text-stone-500">
                          {percent}% ({getOptionCount(index)})
                        </div>
                      </div>
                    ) : (
                      /* Interactive Voting mode */
                      <button
                        onClick={(e) => handleVote(index, e)}
                        className="w-full text-left p-3 border border-stone-200 hover:border-primary-400 bg-white hover:bg-primary-50/20 text-xs font-medium text-stone-700 rounded-lg transition-all"
                      >
                        {opt.text}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            {postState.poll.voted_option_index !== null && (
              <div className="text-[10px] text-stone-400 font-semibold flex justify-end">
                {getPollTotalVotes()} total votes
              </div>
            )}
          </div>
        )}

        {/* Type specific: LOST & FOUND details */}
        {postState.type === 'lost_found' && postState.expires_at && (
          <div className="mt-3 flex items-center gap-1 text-[11px] text-purple-600 font-medium bg-purple-50 w-max px-2 py-0.5 rounded">
            <Clock size={11} />
            <span>Expires {formatTime(postState.expires_at)}</span>
          </div>
        )}
      </div>

      {/* Footer / actions */}
      <div className="mt-4 pt-3.5 border-t border-stone-100 flex items-center gap-6 text-stone-400 text-xs font-medium">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-colors hover:text-red-500 ${
            postState.has_reacted ? 'text-red-500 font-semibold' : ''
          }`}
        >
          <Heart size={16} fill={postState.has_reacted ? 'currentColor' : 'none'} />
          <span>{postState.reaction_count || 0}</span>
        </button>

        <div className="flex items-center gap-1.5 hover:text-stone-600">
          <MessageCircle size={16} />
          <span>{postState.comment_count || 0}</span>
        </div>
      </div>
    </div>
  )
}