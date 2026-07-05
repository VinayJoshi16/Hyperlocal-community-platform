import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Megaphone, Calendar, Search, Briefcase, 
  BarChart2, AlertTriangle, FileText, Plus, X, Loader 
} from 'lucide-react'
import toast from 'react-hot-toast'

import { createPost } from '../../redux/slices/feedSlice'
import { selectActiveLocation } from '../../redux/slices/locationSlice'
import { selectUser } from '../../redux/slices/AuthSlice'
import { selectCreatePostOpen, setCreatePostOpen } from '../../redux/slices/uiSlice'

const POST_TYPES = [
  { type: 'announcement', label: 'Update',       icon: Megaphone,     roles: ['user', 'admin', 'business', 'moderator'] },
  { type: 'event',        label: 'Event',        icon: Calendar,      roles: ['user', 'admin', 'business', 'moderator'] },
  { type: 'lost_found',   label: 'Lost & Found', icon: Search,        roles: ['user', 'admin', 'business', 'moderator'] },
  { type: 'business',     label: 'Business',     icon: Briefcase,     roles: ['business', 'admin'] },
  { type: 'poll',         label: 'Poll',         icon: BarChart2,     roles: ['user', 'admin', 'business', 'moderator'] },
  { type: 'notice',       label: 'Notice',       icon: FileText,      roles: ['admin'] },
  { type: 'emergency',    label: 'Alert',        icon: AlertTriangle, roles: ['admin', 'moderator'] },
]

export default function CreatePostForm() {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const activeLocation = useSelector(selectActiveLocation)
  const isOpen = useSelector(selectCreatePostOpen)
  
  const [type, setType] = useState('announcement')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Event specific fields
  const [eventStartTime, setEventStartTime] = useState('')
  const [eventVenue, setEventVenue] = useState('')

  // Poll specific fields
  const [pollOptions, setPollOptions] = useState(['', ''])

  const userRole = user?.role || 'user'
  const availableTypes = POST_TYPES.filter(t => t.roles.includes(userRole))

  const handleAddPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, ''])
    }
  }

  const handleRemovePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index))
    }
  }

  const handlePollOptionChange = (index, val) => {
    const nextOpts = [...pollOptions]
    nextOpts[index] = val
    setPollOptions(nextOpts)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!activeLocation) {
      toast.error('No active community selected.')
      return
    }
    if (!body.trim()) {
      toast.error('Post content cannot be empty.')
      return
    }

    const payload = {
      locationId: activeLocation.id,
      type,
      title: title.trim() || undefined,
      body: body.trim(),
    }

    if (type === 'event') {
      if (!eventStartTime) {
        toast.error('Please select a start time for the event.')
        return
      }
      payload.event = {
        startTime: new Date(eventStartTime).toISOString(),
        venue: eventVenue.trim() || undefined,
      }
    }

    if (type === 'poll') {
      const filtered = pollOptions.map(o => o.trim()).filter(Boolean)
      if (filtered.length < 2) {
        toast.error('Please provide at least 2 poll options.')
        return
      }
      payload.poll = {
        options: filtered.map(text => ({ text })),
      }
    }

    setIsSubmitting(true)
    try {
      const result = await dispatch(createPost(payload))
      if (result.meta.requestStatus === 'fulfilled') {
        // Reset form states
        setTitle('')
        setBody('')
        setType('announcement')
        setEventStartTime('')
        setEventVenue('')
        setPollOptions(['', ''])
        dispatch(setCreatePostOpen(false))
      }
    } catch (err) {
      toast.error('Failed to publish post.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <div 
        onClick={() => dispatch(setCreatePostOpen(true))}
        className="card p-4 bg-white border border-stone-200 rounded-xl shadow-card cursor-pointer hover:border-stone-300 transition-colors flex items-center gap-3 mb-6"
      >
        <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-xs">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="text-stone-400 text-sm font-medium flex-1">
          Share something with your neighborhood...
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-50 transition-colors">
            <Calendar size={18} />
          </button>
          <button className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-50 transition-colors">
            <BarChart2 size={18} />
          </button>
        </div>
      </div>
    )
  }

  // Emergency form theme changes background to light red
  const isEmergencyType = type === 'emergency'

  return (
    <div className={`card p-5 border rounded-xl shadow-card transition-all mb-6 ${
      isEmergencyType ? 'bg-red-50 border-red-200' : 'bg-white border-stone-200'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-base font-bold ${isEmergencyType ? 'text-red-800' : 'text-stone-800'}`}>
          Create Neighborhood Post
        </h3>
        <button 
          onClick={() => dispatch(setCreatePostOpen(false))} 
          className="text-stone-400 hover:text-stone-600 p-1 hover:bg-stone-50 rounded-full transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Post Type Selector Pills */}
        <div className="flex flex-wrap gap-2 pb-1 border-b border-stone-100 mb-2">
          {availableTypes.map((t) => {
            const isSelected = type === t.type
            const Icon = t.icon
            return (
              <button
                key={t.type}
                type="button"
                onClick={() => setType(t.type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isSelected
                    ? t.type === 'emergency' 
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                }`}
              >
                <Icon size={12} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Optional Title */}
        <div>
          <input
            type="text"
            placeholder="Post Title (Optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            maxLength={150}
          />
        </div>

        {/* Body Text Area */}
        <div>
          <textarea
            required
            rows={4}
            placeholder={
              type === 'emergency' 
                ? 'Describe the emergency details and instructions clearly...' 
                : 'What is happening in your neighborhood?'
            }
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white resize-none"
            maxLength={5000}
          />
        </div>

        {/* Dynamic Fields for EVENTS */}
        {type === 'event' && (
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-3">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Event Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label text-xs">Start Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                  className="input py-2 text-xs"
                />
              </div>
              <div>
                <label className="label text-xs">Venue / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Community Hall"
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                  className="input py-2 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Fields for POLLS */}
        {type === 'poll' && (
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Poll Options</h4>
              {pollOptions.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddPollOption}
                  className="text-xs text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-1"
                >
                  <Plus size={12} /> Add Option
                </button>
              )}
            </div>
            <div className="space-y-2">
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => handlePollOptionChange(i, e.target.value)}
                    className="input py-1.5 text-xs"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePollOption(i)}
                      className="text-stone-400 hover:text-red-500 p-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => dispatch(setCreatePostOpen(false))}
            className="btn-secondary px-4 py-2 text-sm"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`btn-primary px-5 py-2 text-sm flex items-center gap-1.5 ${
              isEmergencyType ? 'bg-red-600 hover:bg-red-700 border-red-600' : ''
            }`}
            disabled={isSubmitting || !body.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader className="animate-spin" size={14} />
                Publishing...
              </>
            ) : isEmergencyType ? (
              'Publish Alert'
            ) : (
              'Publish Post'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}