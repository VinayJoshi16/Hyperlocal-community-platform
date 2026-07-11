// PostCard: one component handles all 7 post types.
// Each type shares the same header (avatar, author, badge, time)
// but gets type-specific content rendering below it.

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { 
  Heart, MessageCircle, Pin, Calendar, MapPin, 
  Users, Check, Clock, AlertTriangle, ArrowRight, X, Maximize2 
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

import { reactToPost } from '../../redux/slices/feedSlice'
import { postsAPI } from '../../services/api'
import { renderBodyWithLinks } from '../../utils/linkify'

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
  const [lightboxMedia, setLightboxMedia] = useState(null)

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
      className={`card p-6 border cursor-pointer hover:border-stone-300 transition-all ${
        isEmergency 
          ? 'bg-red-50/40 border-red-200/90 hover:border-red-300 left-border-emergency' 
          : 'bg-white border-stone-200/80'
      }`}
    >
      {/* Pinned label */}
      {postState.is_pinned && (
        <div className="flex items-center gap-1.5 text-xs text-primary-600 font-bold mb-3">
          <Pin size={12} className="rotate-45 text-primary-500 fill-primary-500" />
          <span>Pinned by Admin</span>
        </div>
      )}

      {/* Moderation Pending review warning label */}
      {postState.is_held_for_review && (
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50/50 border border-amber-200/50 rounded-xl px-3.5 py-2.5 font-bold mb-4 shadow-sm text-left">
          <AlertTriangle size={15} className="text-amber-500 fill-amber-50/20 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <div className="font-extrabold uppercase tracking-wide text-[10px] text-amber-600">Paused: Under Moderation Review</div>
            {postState.moderation_reason && (
              <div className="text-[11px] font-medium text-stone-500 leading-normal normal-case">
                Reason: {postState.moderation_reason}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header section */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {postState.author_avatar ? (
            <img 
              src={postState.author_avatar} 
              className="w-11 h-11 rounded-full object-cover border border-stone-100 flex-shrink-0 shadow-sm"
              alt={postState.author_name} 
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm">
              {postState.author_name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] font-bold text-stone-850">{postState.author_name}</span>
              {postState.author_role && postState.author_role !== 'user' && (
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                  postState.author_role === 'admin' 
                    ? 'bg-red-50 text-red-700 border border-red-100' 
                    : postState.author_role === 'moderator'
                    ? 'bg-purple-50 text-purple-700 border border-purple-100'
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {postState.author_role}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-0.5 font-medium">
              <span>{formatTime(postState.created_at)}</span>
              <span>•</span>
              <span className="font-semibold text-stone-500">{postState.location_name}</span>
            </div>
          </div>
        </div>

        {/* Post Type Badge */}
        <span className={`badge ${typeConfig.className} px-3 py-1 rounded-full text-[11px] font-bold border border-stone-200/20`}>
          {typeConfig.label}
        </span>
      </div>

      {/* Main post contents */}
      <div className="mt-5 text-left">
        {postState.title && (
          <h2 className="text-[17px] font-extrabold text-stone-850 leading-snug mb-2">
            {postState.title}
          </h2>
        )}
        <p className="text-[15px] text-stone-600 leading-relaxed whitespace-pre-wrap line-clamp-3 font-normal">
          {renderBodyWithLinks(postState.body)}
        </p>
        {postState.media_urls && postState.media_urls.length > 0 && (() => {
          const imgUrl = postState.media_urls[0]
          const isContain = imgUrl.endsWith('#contain')
          const isSquare = imgUrl.endsWith('#square')
          
          return (
            <div className={`mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50/20 flex justify-center items-center ${
              isSquare ? 'max-w-sm mx-auto aspect-square' : 'max-h-96 w-full'
            }`}>
              <img 
                src={imgUrl} 
                alt="Post Attachment" 
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxMedia({ type: 'image', url: imgUrl })
                }}
                className={`w-full cursor-zoom-in ${
                  isContain 
                    ? 'object-contain max-h-96 bg-stone-100/40 p-2' 
                    : isSquare 
                    ? 'object-cover aspect-square' 
                    : 'object-cover aspect-video max-h-96'
                }`} 
              />
            </div>
          )
        })()}

        {/* Video Attachments */}
        {postState.video_urls && postState.video_urls.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-stone-950 flex justify-center items-center max-h-[400px] w-full shadow-sm relative group">
            <video 
              src={postState.video_urls[0]} 
              controls 
              className="w-full max-h-[400px] object-contain"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxMedia({ type: 'video', url: postState.video_urls[0] })
              }}
              className="absolute top-3 right-3 bg-black/60 hover:bg-black/85 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider shadow-md"
            >
              <Maximize2 size={12} />
              Full Screen
            </button>
          </div>
        )}

        {/* Document File Attachments */}
        {postState.file_urls && postState.file_urls.length > 0 && (
          <div className="mt-4 space-y-2 select-none">
            {postState.file_urls.map((url, idx) => {
              const fileName = url.substring(url.lastIndexOf('-') + 1) || url.substring(url.lastIndexOf('/') + 1);
              return (
                <a
                  key={idx}
                  href={url}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-between p-3.5 border border-stone-200/80 rounded-xl bg-[#FAFAF9]/40 hover:bg-stone-50/50 hover:border-stone-300 transition-all text-xs font-semibold text-stone-700"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText size={16} className="text-primary-650 flex-shrink-0" />
                    <span className="truncate">{fileName}</span>
                  </div>
                  <span className="text-[10px] text-primary-600 hover:text-primary-750 font-bold uppercase tracking-wider flex-shrink-0">
                    Download
                  </span>
                </a>
              )
            })}
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
      <div className="mt-5 pt-4 border-t border-stone-100/90 flex items-center gap-8 text-stone-400 text-xs font-bold select-none">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 transition-all hover:text-red-500 hover:scale-105 active:scale-95 ${
            postState.has_reacted ? 'text-red-500 font-extrabold' : ''
          }`}
        >
          <Heart size={17} fill={postState.has_reacted ? 'currentColor' : 'none'} className="transition-transform" />
          <span>{postState.reaction_count || 0}</span>
        </button>

        <div className="flex items-center gap-2 hover:text-stone-700 transition-colors hover:scale-105 cursor-pointer">
          <MessageCircle size={17} />
          <span>{postState.comment_count || 0}</span>
        </div>
      </div>

      {/* Lightbox Modal overlay */}
      {lightboxMedia && (
        <div 
          onClick={(e) => {
            e.stopPropagation()
            setLightboxMedia(null)
          }}
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 select-none cursor-zoom-out"
        >
          <button 
            onClick={(e) => {
              e.stopPropagation()
              setLightboxMedia(null)
            }}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all shadow-md"
          >
            <X size={20} />
          </button>

          <div 
            onClick={(e) => e.stopPropagation()} 
            className="max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center"
          >
            {lightboxMedia.type === 'image' ? (
              <img 
                src={lightboxMedia.url} 
                alt="Enlarged view" 
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200" 
              />
            ) : (
              <video 
                src={lightboxMedia.url} 
                controls 
                autoPlay
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200" 
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}