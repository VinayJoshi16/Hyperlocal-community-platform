import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  Send, Users, Calendar, AlertTriangle, ArrowLeft, Plus, Trash2, 
  CheckCircle, Shield, Globe, Lock, EyeOff, MapPin, Clock, Info, Check 
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDistanceToNow, format } from 'date-fns'

import { selectUser } from '../redux/slices/authSlice'
import { selectActiveLocation } from '../redux/slices/locationSlice'
import { circlesAPI } from '../services/api'
import { getSocket } from '../services/socket'

const COLORS = [
  'bg-blue-500 text-white',
  'bg-emerald-500 text-white',
  'bg-violet-500 text-white',
  'bg-amber-500 text-white',
  'bg-rose-500 text-white',
  'bg-indigo-500 text-white',
  'bg-teal-500 text-white',
]

function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % COLORS.length
  return COLORS[index]
}

export default function CircleChatPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const activeLocation = useSelector(selectActiveLocation)

  const [circle, setCircle] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [pins, setPins] = useState([])
  const [polls, setPolls] = useState([])
  const [events, setEvents] = useState([])
  const [members, setMembers] = useState([])
  const [joinRequests, setJoinRequests] = useState([])

  // Sidebar Modals / Forms States
  const [pinInput, setPinInput] = useState('')
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', time: '', location: '' })
  
  // User Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearchingUsers, setIsSearchingUsers] = useState(false)

  // Loading States
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  // Scroller Ref
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (id) {
      loadCircleDetails()
      setupSocketConnection()
    }

    return () => {
      const socket = getSocket()
      if (socket) {
        socket.emit('leave_circle', { circleId: id })
      }
    }
  }, [id])

  // Scroll to bottom when messages load/update
  useEffect(() => {
    scrollToBottom()
    markAllMessagesViewed()
  }, [messages])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function loadCircleDetails() {
    setIsLoading(true)
    try {
      // 1. Get circle profile + member status
      const detailsRes = await circlesAPI.getCircleDetails(id)
      setCircle(detailsRes.data)

      if (detailsRes.data.my_role) {
        // 2. Load sub-widgets
        const [msgRes, pinRes, pollRes, eventRes] = await Promise.all([
          circlesAPI.getMessages(id),
          circlesAPI.getPins(id),
          circlesAPI.getPolls(id),
          circlesAPI.getEvents(id)
        ])

        setMessages(msgRes.data)
        setPins(pinRes.data)
        setPolls(pollRes.data)
        setEvents(eventRes.data)

        if (detailsRes.data.my_role === 'admin') {
          loadJoinRequests()
        }
      }
    } catch (err) {
      toast.error('Failed to load circle details')
      navigate('/circles')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadJoinRequests() {
    try {
      const reqsRes = await circlesAPI.getJoinRequests(id)
      setJoinRequests(reqsRes.data)
    } catch (err) {}
  }

  function setupSocketConnection() {
    const socket = getSocket()
    if (!socket) return

    socket.emit('join_circle', { circleId: id })

    // Receive message
    socket.off('circle_message')
    socket.on('circle_message', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    })

    // Delete message socket broadcast
    socket.off('circle_message_delete')
    socket.on('circle_message_delete', ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
    })

    // Update read Receipts
    socket.off('circle_messages_viewed')
    socket.on('circle_messages_viewed', ({ user_id, message_ids }) => {
      if (user_id === user.id) return // ignore sender
      setMessages((prev) =>
        prev.map((msg) =>
          message_ids.includes(msg.id) ? { ...msg, viewed_by_others: true } : msg
        )
      )
    })

    // Live Polls
    socket.off('circle_poll_update')
    socket.on('circle_poll_update', ({ action, poll, pollId, votes }) => {
      if (action === 'create') {
        setPolls((prev) => {
          if (prev.some((p) => p.id === poll.id)) return prev
          return [poll, ...prev]
        })
      } else if (action === 'vote') {
        setPolls((prev) =>
          prev.map((p) => (p.id === pollId ? { ...p, votes } : p))
        )
      } else if (action === 'delete') {
        setPolls((prev) => prev.filter((p) => p.id !== pollId))
      }
    })

    // Pinboard
    socket.off('circle_pin_update')
    socket.on('circle_pin_update', ({ action, pin, pinId }) => {
      if (action === 'add') {
        setPins((prev) => {
          if (prev.some((p) => p.id === pin.id)) return prev
          return [pin, ...prev]
        })
      } else if (action === 'delete') {
        setPins((prev) => prev.filter((p) => p.id !== pinId))
      }
    })

    // Events
    socket.off('circle_event_update')
    socket.on('circle_event_update', ({ action, event, eventId, count }) => {
      if (action === 'create') {
        setEvents((prev) => {
          if (prev.some((e) => e.id === event.id)) return prev
          return [event, ...prev]
        })
      } else if (action === 'join_toggle') {
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, participant_count: count } : e))
        )
      } else if (action === 'delete') {
        setEvents((prev) => prev.filter((e) => e.id !== eventId))
      }
    })

    // Member joins
    socket.off('circle_member_added')
    socket.on('circle_member_added', () => {
      loadCircleDetails()
    })
  }

  // Mark all unread messages as viewed
  async function markAllMessagesViewed() {
    if (!messages.length) return
    const unviewedIds = messages
      .filter((m) => m.user_id !== user.id && !m.viewed_by_others) // sent by others, viewed = false
      .map((m) => m.id)

    if (unviewedIds.length === 0) return

    try {
      await circlesAPI.markMessagesViewed(id, unviewedIds)
    } catch (err) {}
  }

  async function handleSendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      await circlesAPI.postMessage(id, newMessage.trim())
      setNewMessage('')
    } catch (err) {
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  // Pins Actions
  async function handleAddPin(e) {
    e.preventDefault()
    if (!pinInput.trim()) return
    try {
      await circlesAPI.addPin(id, pinInput.trim())
      setPinInput('')
      toast.success('Notice pinned!')
    } catch (err) {
      toast.error('Failed to pin notice')
    }
  }

  async function handleDeletePin(pinId) {
    try {
      await circlesAPI.deletePin(id, pinId)
      toast.success('Notice removed')
    } catch (err) {
      toast.error('Failed to remove notice')
    }
  }

  // Polls Actions
  async function handleCreatePoll(e) {
    e.preventDefault()
    const filledOptions = pollOptions.filter((o) => o.trim() !== '')
    if (!pollQuestion.trim() || filledOptions.length < 2) {
      toast.error('Poll needs a question and at least 2 options')
      return
    }

    try {
      await circlesAPI.createPoll(id, pollQuestion.trim(), filledOptions)
      setPollQuestion('')
      setPollOptions(['', ''])
      toast.success('Quick Poll created!')
    } catch (err) {
      toast.error('Failed to create poll')
    }
  }

  async function handleVotePoll(pollId, optionIndex) {
    try {
      const res = await circlesAPI.votePoll(id, pollId, optionIndex)
      setPolls((prev) =>
        prev.map((p) => (p.id === pollId ? { ...p, my_vote: res.data.my_vote, votes: res.data.votes } : p))
      )
    } catch (err) {
      toast.error('Failed to cast vote')
    }
  }

  // Events Actions
  async function handleCreateEvent(e) {
    e.preventDefault()
    const { title, description, date, time, location } = eventForm
    if (!title || !date || !time || !location) {
      toast.error('Please fill in all required event details')
      return
    }

    try {
      await circlesAPI.createEvent(id, {
        title: title.trim(),
        description: description.trim(),
        event_date: date,
        event_time: time,
        location: location.trim()
      })
      setEventForm({ title: '', description: '', date: '', time: '', location: '' })
      toast.success('Event scheduled!')
    } catch (err) {
      toast.error('Failed to schedule event')
    }
  }

  async function handleToggleEventJoin(eventId) {
    try {
      const res = await circlesAPI.toggleEvent(id, eventId)
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, joined: res.data.joined, participant_count: res.data.participant_count } : e))
      )
      toast.success(res.data.joined ? 'You joined the event!' : 'You left the event')
    } catch (err) {
      toast.error('Failed to join/leave event')
    }
  }

  async function handleDeleteMessage(messageId) {
    if (!window.confirm('Are you sure you want to delete this message?')) return
    try {
      await circlesAPI.deleteMessage(id, messageId)
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
      toast.success('Message deleted')
    } catch (err) {
      toast.error('Failed to delete message')
    }
  }

  async function handleDeleteEvent(eventId) {
    if (!window.confirm('Are you sure you want to cancel and delete this event?')) return
    try {
      await circlesAPI.deleteEvent(id, eventId)
      setEvents((prev) => prev.filter((e) => e.id !== eventId))
      toast.success('Event deleted')
    } catch (err) {
      toast.error('Failed to delete event')
    }
  }

  async function handleDeletePoll(pollId) {
    if (!window.confirm('Are you sure you want to delete this poll?')) return
    try {
      await circlesAPI.deletePoll(id, pollId)
      setPolls((prev) => prev.filter((p) => p.id !== pollId))
      toast.success('Poll deleted')
    } catch (err) {
      toast.error('Failed to delete poll')
    }
  }

  // Member management
  async function handleSearchUsers(e) {
    const q = e.target.value
    setSearchQuery(q)
    if (!q.trim()) {
      setSearchResults([])
      return
    }

    setIsSearchingUsers(true)
    try {
      const res = await circlesAPI.searchUsers(q)
      setSearchResults(res.data)
    } catch (err) {
    } finally {
      setIsSearchingUsers(false)
    }
  }

  async function handleAddMember(targetUserId) {
    try {
      await circlesAPI.addMember(id, targetUserId)
      toast.success('Resident added directly! 👥')
      setSearchQuery('')
      setSearchResults([])
      loadCircleDetails()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add member')
    }
  }

  async function handleJoinRequestAction(targetUserId, action) {
    try {
      await circlesAPI.handleJoinRequest(id, targetUserId, action)
      toast.success(action === 'approve' ? 'Request approved!' : 'Request rejected')
      loadJoinRequests()
      loadCircleDetails()
    } catch (err) {
      toast.error('Failed to process request')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-primary-500 animate-spin" />
        <span className="text-xs font-semibold text-stone-400">Loading Circle...</span>
      </div>
    )
  }

  if (!circle) return null

  const isMember = !!circle.my_role
  const initials = circle.name.substring(0, 1).toUpperCase()
  const colorClass = getAvatarColor(circle.name)

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 items-stretch animate-fadeIn min-h-[calc(100vh-10rem)]">
      
      {/* Left/Center Column: Chat Window */}
      <div className="flex-1 min-w-0 bg-white border border-stone-200/90 rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        
        {/* Chat header */}
        <div className="px-6 py-4 border-b border-stone-150 flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0 text-left">
            <button
              onClick={() => navigate('/circles')}
              className="p-2 hover:bg-stone-50 rounded-full transition-colors text-stone-500 hover:text-stone-850"
            >
              <ArrowLeft size={16} />
            </button>

            {circle.image_url ? (
              <img
                src={circle.image_url}
                alt={circle.name}
                className="w-9 h-9 rounded-lg object-cover border border-stone-100 flex-shrink-0"
              />
            ) : (
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${colorClass}`}>
                {initials}
              </div>
            )}

            <div className="min-w-0">
              <h3 className="text-sm font-bold text-stone-850 truncate">{circle.name}</h3>
              <p className="text-[10px] font-semibold text-stone-400 tracking-wide mt-0.5">
                👥 {circle.member_count} Members • {circle.privacy.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Not Member Gate */}
        {!isMember ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400">
              <Lock size={24} />
            </div>
            <h3 className="text-sm font-bold text-stone-800">Membership Required</h3>
            <p className="text-xs text-stone-500 max-w-sm">
              {circle.privacy === 'private' 
                ? 'This community circle is private. You must submit a join request to the administrator to enter and view the conversation.'
                : 'This circle is invite-only. You must be added directly by a circle administrator.'}
            </p>
            {circle.privacy === 'private' && (
              <button
                onClick={() => handleJoin(circle.id)}
                className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold"
              >
                Request to Join Circle
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[50vh] xl:max-h-[58vh]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-2">
                  <span className="text-xl">💬</span>
                  <p className="text-xs font-bold">No Messages Yet</p>
                  <p className="text-[10px]">Be the first to say hi and start collaborating with your neighbors!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.user_id === user.id
                  const msgInitials = msg.author_name.substring(0, 1).toUpperCase()
                  const msgColorClass = getAvatarColor(msg.author_name)

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 text-left relative group ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Sender avatar - incoming only */}
                      {!isOwn && (
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] flex-shrink-0 ${msgColorClass}`}>
                          {msgInitials}
                        </div>
                      )}

                      <div className="space-y-1 max-w-[70%]">
                        {/* Sender name */}
                        {!isOwn && (
                          <span className="text-[10px] font-bold text-stone-400 px-1">
                            {msg.author_name}
                          </span>
                        )}

                        {/* Bubble */}
                        <div className="flex items-end gap-1.5 relative">
                          {/* Trash button for admins to delete other users' messages or creators to delete their own */}
                          {(isOwn || circle.my_role === 'admin') && (
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className={`opacity-0 group-hover:opacity-100 p-1 text-stone-450 hover:text-red-500 transition-opacity absolute top-1 ${
                                isOwn ? '-left-6' : '-right-6'
                              }`}
                              title="Delete message"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm font-medium ${
                              isOwn
                                ? 'bg-primary-500 text-white rounded-br-none'
                                : 'bg-stone-50 border border-stone-150 text-stone-750 rounded-bl-none'
                            }`}
                          >
                            <p className="break-words white-space-pre-wrap">{msg.message}</p>
                            <div
                              className={`text-[8px] font-bold mt-1 text-right select-none ${
                                isOwn ? 'text-primary-100' : 'text-stone-400'
                              }`}
                            >
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </div>
                          </div>

                          {/* Unique View Receipt Indicator (White/Blue Dot) next to bubble */}
                          {isOwn && (
                            <div className="pb-2">
                              <span
                                className={`w-2 h-2 rounded-full border border-stone-250 inline-block transition-colors duration-300 ${
                                  msg.viewed_by_others ? 'bg-blue-500' : 'bg-white'
                                }`}
                                title={msg.viewed_by_others ? 'Viewed by members' : 'Delivered'}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-stone-150 flex items-center gap-3">
              <input
                type="text"
                placeholder="Type a message to the group..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isSending}
                className="flex-1 h-11 px-4 border border-stone-200 rounded-xl text-xs font-semibold placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500/80 transition-all bg-stone-50/30"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className="h-11 w-11 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:bg-stone-100 text-white disabled:text-stone-400 flex items-center justify-center shadow-md transition-all flex-shrink-0"
              >
                <Send size={15} />
              </button>
            </form>
          </>
        )}
      </div>

      {/* Right Column: Interactive Sidebar Widgets (Collaboration Lounge) */}
      {isMember && (
        <aside className="w-full xl:w-[340px] flex-shrink-0 flex flex-col gap-6">
          
          {/* Upcoming Shared Events Widget */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-left space-y-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar size={13} />
              Upcoming Events
            </h3>

            {/* Events List */}
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {events.length === 0 ? (
                <p className="text-[11px] text-stone-400 italic">No community events planned.</p>
              ) : (
                events.map((ev) => (
                  <div key={ev.id} className="p-3 bg-stone-50/50 border border-stone-150 rounded-2xl text-left space-y-2 relative group">
                    {/* Delete Event Button */}
                    {(ev.created_by === user.id || circle.my_role === 'admin') && (
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="absolute bottom-2.5 right-2.5 text-stone-450 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Event"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-stone-850 truncate pr-6">{ev.title}</h4>
                      <button
                        onClick={() => handleToggleEventJoin(ev.id)}
                        className={`h-6 px-2.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 flex-shrink-0 ${
                          ev.joined 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {ev.joined ? <Check size={10} /> : null}
                        {ev.joined ? 'Going' : 'Join'}
                      </button>
                    </div>
                    {ev.description && <p className="text-[10px] text-stone-500 font-medium leading-relaxed">{ev.description}</p>}
                    
                    <div className="flex flex-col gap-1 text-[9px] font-semibold text-stone-400 mt-1">
                      <span className="flex items-center gap-1">📅 {format(new Date(ev.event_date), 'MMM dd, yyyy')}</span>
                      <span className="flex items-center gap-1">🕖 {ev.event_time.substring(0, 5)}</span>
                      <span className="flex items-center gap-1">📍 {ev.location}</span>
                    </div>

                    <div className="text-[8px] font-bold text-stone-400 bg-stone-100 rounded-md px-1.5 py-0.5 inline-block mt-1">
                      👥 {ev.participant_count} Participants
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Event Scheduler Form */}
            <form onSubmit={handleCreateEvent} className="border-t border-stone-100 pt-3.5 space-y-2.5">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Schedule Event</p>
              <input
                type="text"
                required
                placeholder="Event Title (e.g. Cricket Match)"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                className="w-full h-8 px-2.5 border border-stone-200 rounded-lg text-[10px] font-medium"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  required
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="w-full h-8 px-2 border border-stone-200 rounded-lg text-[10px]"
                />
                <input
                  type="time"
                  required
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  className="w-full h-8 px-2 border border-stone-200 rounded-lg text-[10px]"
                />
              </div>
              <input
                type="text"
                required
                placeholder="Location (e.g. Society Ground)"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                className="w-full h-8 px-2.5 border border-stone-200 rounded-lg text-[10px] font-medium"
              />
              <button
                type="submit"
                className="w-full h-8 bg-stone-850 hover:bg-black text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                Schedule Event
              </button>
            </form>
          </div>

          {/* Notice Pinboard Widget */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-left space-y-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
              📌 Notice Pinboard
            </h3>
            
            <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
              {pins.length === 0 ? (
                <p className="text-[11px] text-stone-400 italic">No pinned notices for this circle.</p>
              ) : (
                pins.map((pin) => (
                  <div key={pin.id} className="p-3 bg-yellow-50/50 border border-yellow-100 rounded-2xl relative group">
                    <p className="text-[11px] text-stone-700 font-semibold leading-relaxed pr-6">{pin.content}</p>
                    <span className="text-[8px] font-bold text-stone-400 block mt-1">
                      Pin by {pin.creator_name}
                    </span>
                    <button
                      onClick={() => handleDeletePin(pin.id)}
                      className="absolute top-2.5 right-2.5 text-stone-450 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddPin} className="border-t border-stone-100 pt-3 flex gap-2">
              <input
                type="text"
                placeholder="Pin a notice to the group..."
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="flex-1 h-8 px-2.5 border border-stone-200 rounded-lg text-[10px] font-semibold"
              />
              <button
                type="submit"
                className="h-8 px-3 bg-stone-100 border border-stone-200 hover:bg-stone-150 rounded-lg text-[10px] font-bold text-stone-600 transition-colors"
              >
                Pin
              </button>
            </form>
          </div>

          {/* Quick Live Poll Widget */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-left space-y-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
              📊 Live Quick-Polls
            </h3>

            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {polls.length === 0 ? (
                <p className="text-[11px] text-stone-400 italic">No active polls in this group.</p>
              ) : (
                polls.map((poll) => {
                  const totalVotes = poll.votes.reduce((a, b) => a + b, 0)
                  return (
                    <div key={poll.id} className="space-y-2.5 p-3.5 bg-stone-50/50 border border-stone-150 rounded-2xl text-left relative group">
                      {/* Delete Poll Button */}
                      {(poll.created_by === user.id || circle.my_role === 'admin') && (
                        <button
                          onClick={() => handleDeletePoll(poll.id)}
                          className="absolute top-2.5 right-2.5 text-stone-450 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete Poll"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                      <h4 className="text-xs font-bold text-stone-850 leading-snug pr-6">{poll.question}</h4>
                      
                      <div className="space-y-2">
                        {poll.options.map((opt, optIdx) => {
                          const votes = poll.votes[optIdx] || 0
                          const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
                          const isVoted = poll.my_vote === optIdx

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleVotePoll(poll.id, optIdx)}
                              className={`w-full text-left p-2 border rounded-xl relative overflow-hidden transition-all text-[11px] font-semibold flex items-center justify-between ${
                                isVoted ? 'border-primary-350 bg-primary-50/10' : 'border-stone-200 bg-white hover:bg-stone-50'
                              }`}
                            >
                              <div
                                className="absolute top-0 left-0 bottom-0 bg-primary-100/30 transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                              <span className="relative z-10 text-stone-700">{opt}</span>
                              <span className="relative z-10 text-stone-400 font-bold">{pct}% ({votes})</span>
                            </button>
                          )
                        })}
                      </div>

                      <span className="text-[8px] font-bold text-stone-400 block mt-1">
                        Creator: {poll.creator_name} • Total votes: {totalVotes}
                      </span>
                    </div>
                  )
                })
              )}
            </div>

            <form onSubmit={handleCreatePoll} className="border-t border-stone-100 pt-3.5 space-y-2.5">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Create Quick Poll</p>
              <input
                type="text"
                required
                placeholder="Question (e.g. When do we meet?)"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="w-full h-8 px-2.5 border border-stone-200 rounded-lg text-[10px] font-semibold"
              />
              <div className="space-y-1.5">
                {pollOptions.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    required={idx < 2}
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...pollOptions]
                      newOpts[idx] = e.target.value
                      setPollOptions(newOpts)
                    }}
                    className="w-full h-8 px-2.5 border border-stone-200 rounded-lg text-[10px]"
                  />
                ))}
              </div>
              <button
                type="submit"
                className="w-full h-8 bg-stone-850 hover:bg-black text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center"
              >
                Post Poll
              </button>
            </form>
          </div>

          {/* Member Manager / Direct Add / Request Approver */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-left space-y-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
              <Users size={12} />
              Member Manager
            </h3>

            {/* Pending Requests - Admins Only */}
            {circle.my_role === 'admin' && joinRequests.length > 0 && (
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
                  <ShieldAlert size={10} />
                  Pending Join Requests ({joinRequests.length})
                </span>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {joinRequests.map((req) => (
                    <div key={req.user_id} className="p-2.5 bg-stone-50 border border-stone-150 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-bold text-stone-800 truncate">{req.name}</p>
                        <p className="text-[9px] text-stone-400 truncate">{req.email}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleJoinRequestAction(req.user_id, 'approve')}
                          className="h-6 px-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-bold rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleJoinRequestAction(req.user_id, 'reject')}
                          className="h-6 px-2 bg-stone-200 hover:bg-stone-300 text-stone-600 text-[9px] font-bold rounded"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Add Resident Panel */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Invite Neighbor</p>
              <input
                type="text"
                placeholder="Search neighbor by name/email..."
                value={searchQuery}
                onChange={handleSearchUsers}
                className="w-full h-8 px-2.5 border border-stone-200 rounded-lg text-[10px]"
              />

              {/* User search results dropdown list */}
              {searchResults.length > 0 && (
                <div className="border border-stone-200 rounded-lg bg-white shadow-md max-h-[150px] overflow-y-auto pr-1">
                  {searchResults.map((usr) => (
                    <button
                      key={usr.id}
                      onClick={() => handleAddMember(usr.id)}
                      className="w-full text-left p-2 hover:bg-stone-50 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-stone-850 truncate">{usr.name}</p>
                        <p className="text-[9px] text-stone-400 truncate">{usr.email}</p>
                      </div>
                      <span className="text-[9px] font-bold text-primary-600 border border-primary-150 px-1.5 py-0.5 rounded bg-primary-50/20">
                        Add Direct
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}
