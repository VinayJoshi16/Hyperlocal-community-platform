// Full post detail page:
// - Complete post content (no line-clamp)
// - Event card with RSVP button
// - Poll with animated progress bar voting UI
// - Comments thread with author avatars
// - Add comment form
// - Delete controls (own content or admin/mod)

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  Heart, MessageCircle, Pin, Calendar, MapPin, 
  Users, Check, Trash2, ArrowLeft, Send, 
  CornerDownRight, Loader2, Clock, AlertTriangle 
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

import { selectUser } from '../redux/slices/authSlice'
import { postsAPI } from '../services/api'
import { renderBodyWithLinks } from '../utils/linkify'

const TYPE_CONFIG = {
  announcement: { label: 'Update',       className: 'badge-stone' },
  notice:       { label: 'Notice',       className: 'badge-blue' },
  event:        { label: 'Event',        className: 'badge-green' },
  lost_found:   { label: 'Lost & Found', className: 'badge bg-purple-50 text-purple-700' },
  business:     { label: 'Business',     className: 'badge-amber' },
  poll:         { label: 'Poll',         className: 'badge bg-indigo-50 text-indigo-700' },
  emergency:    { label: 'Emergency',    className: 'badge-red' },
}

export default function PostDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currentUser = useSelector(selectUser)

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  // Comment input state
  const [commentText, setCommentText] = useState('')
  const [replyToId, setReplyToId] = useState(null)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const commentInputRef = useRef(null)

  // Fetch post and comments on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [postRes, commentsRes] = await Promise.all([
          postsAPI.getPost(id),
          postsAPI.getComments(id)
        ])
        setPost(postRes.data.data.post)
        setComments(commentsRes.data.data.comments || [])
      } catch (err) {
        toast.error('Failed to load post details.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const formatTime = (dateStr) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
    } catch (_) {
      return ''
    }
  }

  const handleLike = async () => {
    if (post && post.is_held_for_review) {
      toast.error('Reactions are disabled while this post is under moderation review.')
      return
    }
    try {
      const res = await postsAPI.react(id)
      const { action, reactions } = res.data.data
      setPost(prev => ({
        ...prev,
        has_reacted: action === 'added',
        reaction_count: reactions.reduce((sum, r) => sum + r.count, 0)
      }))
    } catch (err) {
      toast.error('Failed to update reaction.')
    }
  }

  const handleRsvp = async () => {
    if (post.event?.has_rsvped) return
    try {
      const res = await postsAPI.rsvp(id)
      if (res.status === 200 || res.status === 201) {
        setPost(prev => ({
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
  }

  const handleVote = async (optionIndex) => {
    if (post.poll?.voted_option_index !== null) return
    try {
      const res = await postsAPI.vote(id, optionIndex)
      setPost(prev => {
        const nextPoll = { ...prev.poll, voted_option_index: optionIndex }
        nextPoll.votes = res.data.data.votes
        return { ...prev, poll: nextPoll }
      })
      toast.success('Vote cast successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit vote.')
    }
  }

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    try {
      await postsAPI.deletePost(id)
      toast.success('Post deleted successfully.')
      navigate('/feed')
    } catch (err) {
      toast.error('Failed to delete post.')
    }
  }

  const handleTogglePin = async () => {
    try {
      const res = await postsAPI.togglePin(id)
      setPost(prev => ({
        ...prev,
        is_pinned: res.data.data.post.is_pinned
      }))
      toast.success(res.data.data.post.is_pinned ? 'Post pinned.' : 'Post unpinned.')
    } catch (err) {
      toast.error('Failed to toggle pin state.')
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || isSubmittingComment) return

    setIsSubmittingComment(true)
    try {
      const res = await postsAPI.addComment(id, commentText.trim(), replyToId || undefined)
      const newComment = {
        ...res.data.data.comment,
        author_name: currentUser.name,
        author_avatar: currentUser.avatar_url,
        author_role: currentUser.role
      }
      setComments(prev => [...prev, newComment])
      setCommentText('')
      setReplyToId(null)
      toast.success('Comment posted.')
    } catch (err) {
      toast.error('Failed to submit comment.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return
    try {
      await postsAPI.deleteComment(id, commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
      toast.success('Comment deleted.')
    } catch (err) {
      toast.error('Failed to delete comment.')
    }
  }

  const handleReplyClick = (comment) => {
    setReplyToId(comment.id)
    setCommentText(`@${comment.author_name} `)
    commentInputRef.current?.focus()
  }

  if (loading) {
    return (
      <div className="max-w-feed mx-auto w-full px-4 py-16 flex flex-col items-center justify-center text-stone-400 gap-3">
        <Loader2 className="animate-spin text-stone-400" size={32} />
        <span className="text-xs font-semibold">Loading post detail...</span>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-feed mx-auto w-full px-4 py-16 text-center">
        <h2 className="text-lg font-bold text-stone-700">Post not found</h2>
        <button onClick={() => navigate('/feed')} className="btn-primary mt-4 py-2">
          Back to Feed
        </button>
      </div>
    )
  }

  const typeConfig = TYPE_CONFIG[post.type] || { label: 'Post', className: 'badge-stone' }
  const isEmergency = post.type === 'emergency'
  const isAuthor = post.author_id === currentUser?.id
  const canModerate = ['admin', 'moderator'].includes(currentUser?.role)

  // Poll results calculator helpers
  const getPollTotalVotes = () => {
    const votesArr = post.poll?.votes || []
    return votesArr.reduce((sum, v) => sum + v.count, 0)
  }

  const getOptionPercentage = (index) => {
    const total = getPollTotalVotes()
    if (total === 0) return 0
    const votesArr = post.poll?.votes || []
    const match = votesArr.find(v => v.option_index === index)
    return match ? Math.round((match.count / total) * 100) : 0
  }

  const getOptionCount = (index) => {
    const votesArr = post.poll?.votes || []
    const match = votesArr.find(v => v.option_index === index)
    return match ? match.count : 0
  }

  // Comment Thread logic: root vs replies
  const rootComments = comments.filter(c => !c.parent_id)
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId)

  return (
    <div className="max-w-feed mx-auto w-full px-4 py-6 space-y-6">
      
      {/* Back button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-750 transition-colors uppercase"
      >
        <ArrowLeft size={14} /> Back
      </button>

      {/* Main Post Card */}
      <div className={`card p-6 border ${
        isEmergency ? 'bg-red-50/50 border-red-200 left-border-emergency' : 'bg-white border-stone-200'
      } rounded-xl shadow-card`}>
        
        {/* Pinned banner */}
        {post.is_pinned && (
          <div className="flex items-center gap-1 text-xs text-primary-600 font-semibold mb-3">
            <Pin size={12} className="rotate-45" />
            <span>Pinned by Admin</span>
          </div>
        )}

        {/* Moderation Pending review warning label */}
        {post.is_held_for_review && (
          <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50/50 border border-amber-200/50 rounded-xl px-3.5 py-2.5 font-bold mb-4 shadow-sm text-left">
            <AlertTriangle size={15} className="text-amber-500 fill-amber-50/20 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <div className="font-extrabold uppercase tracking-wide text-[10px] text-amber-600">Paused: Under Moderation Review</div>
              {post.moderation_reason && (
                <div className="text-[11px] font-medium text-stone-500 leading-normal normal-case">
                  Reason: {post.moderation_reason}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {post.author_avatar ? (
              <img 
                src={post.author_avatar} 
                className="w-10 h-10 rounded-full object-cover border border-stone-100 flex-shrink-0"
                alt={post.author_name} 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {post.author_name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-stone-850">{post.author_name}</span>
                {post.author_role && post.author_role !== 'user' && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    post.author_role === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : post.author_role === 'moderator'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {post.author_role}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                {formatTime(post.created_at)} • <span className="font-semibold text-stone-500">{post.location_name}</span>
              </p>
            </div>
          </div>

          <span className={`badge ${typeConfig.className} px-2.5 py-0.5 rounded-full text-xs font-semibold`}>
            {typeConfig.label}
          </span>
        </div>

        {/* Title and Body */}
        <div className="mt-5 space-y-3">
          {post.title && (
            <h1 className="text-lg font-extrabold text-stone-900 leading-snug">
              {post.title}
            </h1>
          )}
          <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">
            {renderBodyWithLinks(post.body)}
          </p>
          {post.media_urls && post.media_urls.length > 0 && (() => {
            const imgUrl = post.media_urls[0]
            const isContain = imgUrl.endsWith('#contain')
            const isSquare = imgUrl.endsWith('#square')
            
            return (
              <div className={`mt-4 overflow-hidden rounded-xl border border-stone-200 bg-stone-50/30 flex justify-center items-center ${
                isSquare ? 'max-w-sm mx-auto aspect-square' : 'max-h-96 w-full'
              }`}>
                <img 
                  src={imgUrl} 
                  alt="Post Attachment" 
                  className={`w-full ${
                    isContain 
                      ? 'object-contain max-h-96 bg-stone-100/60 p-1.5' 
                      : isSquare 
                      ? 'object-cover aspect-square' 
                      : 'object-cover aspect-video max-h-96'
                  }`} 
                />
              </div>
            )
          })()}

          {/* EVENTS Section */}
          {post.type === 'event' && post.event && (
            <div className="mt-4 p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-green-600 flex-shrink-0" />
                  <span className="font-medium">{new Date(post.event.start_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
                {post.event.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-green-600 flex-shrink-0" />
                    <span className="truncate font-medium">{post.event.venue}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-stone-200/60 pt-3">
                <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold">
                  <Users size={14} />
                  <span>{post.event.rsvp_count || 0} attending</span>
                </div>
                <button
                  onClick={handleRsvp}
                  disabled={post.event.has_rsvped}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    post.event.has_rsvped
                      ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                  }`}
                >
                  {post.event.has_rsvped ? (
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

          {/* POLLS Section */}
          {post.type === 'poll' && post.poll && (
            <div className="mt-4 p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
              <div className="space-y-2.5">
                {post.poll.options.map((opt, index) => {
                  const votedForThis = post.poll.voted_option_index === index
                  const hasVoted = post.poll.voted_option_index !== null
                  const percent = getOptionPercentage(index)
                  
                  return (
                    <div key={index} className="relative">
                      {hasVoted ? (
                        <div className="flex items-center justify-between p-3 border border-stone-200 rounded-lg overflow-hidden relative bg-white text-xs">
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
                        <button
                          onClick={() => handleVote(index)}
                          className="w-full text-left p-3 border border-stone-200 hover:border-primary-400 bg-white hover:bg-primary-50/20 text-xs font-semibold text-stone-750 rounded-lg transition-all"
                        >
                          {opt.text}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
              {post.poll.voted_option_index !== null && (
                <div className="text-[10px] text-stone-400 font-semibold flex justify-end">
                  {getPollTotalVotes()} total votes
                </div>
              )}
            </div>
          )}

          {/* LOST & FOUND details */}
          {post.type === 'lost_found' && post.expires_at && (
            <div className="mt-3 flex items-center gap-1 text-[11px] text-purple-600 font-medium bg-purple-50 w-max px-2 py-0.5 rounded">
              <Clock size={11} />
              <span>Expires {formatTime(post.expires_at)}</span>
            </div>
          )}
        </div>

        {/* Footer info & reactions */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-6 text-stone-400 text-xs font-medium">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors hover:text-red-500 ${
                post.has_reacted ? 'text-red-500 font-bold' : ''
              }`}
            >
              <Heart size={18} fill={post.has_reacted ? 'currentColor' : 'none'} />
              <span>{post.reaction_count || 0}</span>
            </button>

            <div className="flex items-center gap-1.5 text-stone-500">
              <MessageCircle size={18} />
              <span>{comments.length} comments</span>
            </div>
          </div>

          {/* Admin / Owner Actions */}
          <div className="flex items-center gap-2">
            {(isAuthor || canModerate) && (
              <button
                onClick={handleTogglePin}
                className={`p-1.5 border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  post.is_pinned 
                    ? 'bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100'
                    : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                }`}
              >
                <Pin size={13} className={post.is_pinned ? 'rotate-0' : 'rotate-45'} />
                {post.is_pinned ? 'Pinned' : 'Pin'}
              </button>
            )}
            {(isAuthor || canModerate) && (
              <button
                onClick={handleDeletePost}
                className="p-1.5 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                title="Delete Post"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Thread section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
          Discussion ({comments.length})
        </h3>

        {/* Create comment form */}
        {post.is_held_for_review ? (
          <div className="card p-4 text-center text-amber-700 bg-amber-50/30 border border-amber-250/50 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2">
            <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
            <span>Commenting is disabled while this post is under moderation review.</span>
          </div>
        ) : (
          <form onSubmit={handleAddComment} className="flex gap-3 items-end">
            <div className="flex-1">
              {replyToId && (
                <div className="flex items-center justify-between bg-stone-100 px-3 py-1.5 rounded-t-lg border-x border-t border-stone-200 text-[11px] text-stone-500 font-medium">
                  <span>Replying to comment thread...</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setReplyToId(null)
                      setCommentText('')
                    }}
                    className="hover:text-stone-850"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <textarea
                ref={commentInputRef}
                required
                rows={replyToId ? 2 : 3}
                placeholder="Write a constructive reply..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className={`w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white resize-none ${
                  replyToId ? 'rounded-t-none' : ''
                }`}
                maxLength={1000}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmittingComment || !commentText.trim()}
              className="btn-primary py-2.5 px-4 flex items-center justify-center gap-1.5 h-[42px] rounded-lg self-end"
            >
              {isSubmittingComment ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <Send size={14} /> Reply
                </>
              )}
            </button>
          </form>
        )}

        {/* Comments list */}
        {rootComments.length === 0 ? (
          <div className="card py-10 text-center text-stone-400 text-sm font-semibold bg-white border border-stone-200 rounded-xl">
            No replies yet. Be the first to start the discussion!
          </div>
        ) : (
          <div className="space-y-4">
            {rootComments.map((comment) => {
              const replies = getReplies(comment.id)
              const isCommentAuthor = comment.author_id === currentUser?.id
              const canDeleteComment = isCommentAuthor || canModerate

              return (
                <div key={comment.id} className="card p-4 bg-white border border-stone-200 rounded-xl shadow-sm space-y-3">
                  
                  {/* Comment Author Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {comment.author_avatar ? (
                        <img 
                          src={comment.author_avatar} 
                          className="w-7 h-7 rounded-full object-cover border border-stone-100 flex-shrink-0"
                          alt={comment.author_name} 
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {comment.author_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-xs font-semibold text-stone-850">{comment.author_name}</span>
                          {comment.author_role && comment.author_role !== 'user' && (
                            <span className="px-1 py-0.2 bg-stone-100 text-stone-600 rounded text-[8px] font-bold uppercase tracking-wider">
                              {comment.author_role}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400 mt-0.5">{formatTime(comment.created_at)}</p>
                      </div>
                    </div>

                    {canDeleteComment && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-stone-400 hover:text-red-500 p-1"
                        title="Delete Reply"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {/* Comment Body */}
                  <p className="text-xs text-stone-650 leading-relaxed pl-9 whitespace-pre-wrap">
                    {comment.body}
                  </p>

                  {/* Reply trigger button */}
                  <div className="pl-9 flex gap-4 text-[10px] text-stone-400 font-bold">
                    <button 
                      onClick={() => handleReplyClick(comment)}
                      className="hover:text-primary-600 transition-colors uppercase tracking-wider flex items-center gap-1"
                    >
                      Reply to this
                    </button>
                  </div>

                  {/* Nested Replies Thread (1 level deep) */}
                  {replies.length > 0 && (
                    <div className="pl-9 space-y-3.5 pt-2 border-l-2 border-stone-100 ml-3.5 mt-2">
                      {replies.map((reply) => {
                        const isReplyAuthor = reply.author_id === currentUser?.id
                        const canDeleteReply = isReplyAuthor || canModerate

                        return (
                          <div key={reply.id} className="space-y-1.5 relative">
                            <div className="absolute -left-5 top-2.5 text-stone-300">
                              <CornerDownRight size={12} />
                            </div>

                            {/* Reply Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                {reply.author_avatar ? (
                                  <img 
                                    src={reply.author_avatar} 
                                    className="w-6 h-6 rounded-full object-cover border border-stone-100 flex-shrink-0"
                                    alt={reply.author_name} 
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                                    {reply.author_name?.[0]?.toUpperCase() || 'U'}
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <span className="text-[11px] font-bold text-stone-850">{reply.author_name}</span>
                                    {reply.author_role && reply.author_role !== 'user' && (
                                      <span className="px-1 py-0.2 bg-stone-100 text-stone-600 rounded text-[7px] font-bold uppercase">
                                        {reply.author_role}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[9px] text-stone-400 mt-0.5">{formatTime(reply.created_at)}</p>
                                </div>
                              </div>

                              {canDeleteReply && (
                                <button
                                  onClick={() => handleDeleteComment(reply.id)}
                                  className="text-stone-400 hover:text-red-500 p-0.5"
                                  title="Delete Reply"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>

                            {/* Reply Body */}
                            <p className="text-xs text-stone-600 leading-relaxed pl-8 whitespace-pre-wrap">
                              {reply.body}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}