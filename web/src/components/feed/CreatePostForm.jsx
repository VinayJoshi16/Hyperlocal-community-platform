import { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Megaphone, Calendar, Search, Briefcase, 
  BarChart2, AlertTriangle, FileText, Plus, X, Loader,
  Image as ImageIcon, Sparkles, ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'

import { createPost } from '../../redux/slices/feedSlice'
import { selectActiveLocation, selectMyLocations } from '../../redux/slices/locationSlice'
import { selectUser } from '../../redux/slices/AuthSlice'
import { selectCreatePostOpen, setCreatePostOpen } from '../../redux/slices/uiSlice'
import { postsAPI } from '../../services/api'

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
  const myLocations = useSelector(selectMyLocations)
  const isOpen = useSelector(selectCreatePostOpen)
  
  const [type, setType] = useState('announcement')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Visibility Scoping states
  const [scopeMode, setScopeMode] = useState('local') // 'local' | 'city' | 'state' | 'country' | 'custom'
  const [customRadius, setCustomRadius] = useState(5) // radius in km
  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false)

  const cityLocation = myLocations.find(l => l.type === 'city')
  const stateLocation = myLocations.find(l => l.type === 'state')
  const countryLocation = myLocations.find(l => l.type === 'country')

  const getCoordinates = () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              type: 'Point',
              coordinates: [pos.coords.longitude, pos.coords.latitude]
            })
          },
          () => resolve(null)
        )
      } else {
        resolve(null)
      }
    })
  }

  // Event specific fields
  const [eventStartTime, setEventStartTime] = useState('')
  const [eventVenue, setEventVenue] = useState('')

  // Poll specific fields
  const [pollOptions, setPollOptions] = useState(['', ''])

  // Photo upload specific fields
  const [mediaUrl, setMediaUrl] = useState('')
  const [imageFit, setImageFit] = useState('cover')
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef(null)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    setUploadingImage(true)
    try {
      const res = await postsAPI.uploadImage(formData)
      if (res.data.success) {
        setMediaUrl(res.data.url)
        toast.success('Image uploaded successfully!')
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to upload image.'
      toast.error(errMsg)
      console.error(err)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setMediaUrl('')
    setImageFit('cover')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // AI Spelling & Grammar correction specific fields
  const [correctingText, setCorrectingText] = useState(false)

  const handleAICorrect = async () => {
    if (!body.trim()) {
      toast.error('Please enter some text in the body to correct.')
      return
    }

    setCorrectingText(true)
    try {
      const res = await postsAPI.correctGrammar(body)
      if (res.data.success) {
        setBody(res.data.correctedText)
      }
    } catch (err) {
      toast.error('Failed to correct spelling/grammar.')
    } finally {
      setCorrectingText(false)
    }
  }

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

    let targetLocationId = activeLocation.id
    if (scopeMode === 'city' && cityLocation) targetLocationId = cityLocation.id
    else if (scopeMode === 'state' && stateLocation) targetLocationId = stateLocation.id
    else if (scopeMode === 'country' && countryLocation) targetLocationId = countryLocation.id

    const payload = {
      locationId: targetLocationId,
      type,
      title: title.trim() || undefined,
      body: body.trim(),
      mediaUrls: mediaUrl ? [`${mediaUrl}#${imageFit}`] : undefined
    }

    if (scopeMode === 'custom') {
      payload.spreadRadius = customRadius
      const coords = await getCoordinates()
      if (coords) {
        payload.geoPoint = coords
      }
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
        setMediaUrl('')
        setImageFit('cover')
        setScopeMode('local')
        setCustomRadius(5)
        if (fileInputRef.current) fileInputRef.current.value = ''
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

        {/* Post Visibility Selector */}
        <div className="relative">
          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1 select-none">
            Post Visibility / Audience Scope
          </label>
          <button
            type="button"
            onClick={() => setScopeDropdownOpen(!scopeDropdownOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2 border border-stone-200 rounded-lg text-xs bg-white hover:bg-stone-50 hover:border-stone-300 transition-all font-semibold text-stone-700 shadow-sm"
          >
            <span className="flex items-center gap-1.5 truncate">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                scopeMode === 'custom' ? 'bg-purple-500' : 'bg-primary-500'
              }`} />
              {scopeMode === 'local' && `Local Neighborhood (${activeLocation?.name || 'Loading...'})`}
              {scopeMode === 'city' && `City-wide (${cityLocation?.name || 'City'})`}
              {scopeMode === 'state' && `State-wide (${stateLocation?.name || 'State'})`}
              {scopeMode === 'country' && `Country-wide (${countryLocation?.name || 'Country'})`}
              {scopeMode === 'custom' && `Custom Area (${customRadius} km Radius)`}
            </span>
            <ChevronDown size={14} className={`text-stone-400 flex-shrink-0 transition-transform duration-200 ${scopeDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {scopeDropdownOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-lg z-50 py-1 divide-y divide-stone-100 animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* Option: Local */}
              <button
                type="button"
                onClick={() => {
                  setScopeMode('local')
                  setScopeDropdownOpen(false)
                }}
                className={`w-full text-left px-4 py-2 hover:bg-stone-50 transition-colors flex flex-col ${
                  scopeMode === 'local' ? 'bg-primary-50/10 text-primary-700' : 'text-stone-600'
                }`}
              >
                <span className="text-xs font-bold">Local Neighborhood Only</span>
                <span className="text-[10px] text-stone-400 font-medium mt-0.5">Visible to {activeLocation?.name || 'neighborhood'} residents</span>
              </button>

              {/* Option: City */}
              {cityLocation && (
                <button
                  type="button"
                  onClick={() => {
                    setScopeMode('city')
                    setScopeDropdownOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-stone-50 transition-colors flex flex-col ${
                    scopeMode === 'city' ? 'bg-primary-50/10 text-primary-700' : 'text-stone-600'
                  }`}
                >
                  <span className="text-xs font-bold">City-wide</span>
                  <span className="text-[10px] text-stone-400 font-medium mt-0.5">Visible to everyone in {cityLocation.name}</span>
                </button>
              )}

              {/* Option: State */}
              {stateLocation && (
                <button
                  type="button"
                  onClick={() => {
                    setScopeMode('state')
                    setScopeDropdownOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-stone-50 transition-colors flex flex-col ${
                    scopeMode === 'state' ? 'bg-primary-50/10 text-primary-700' : 'text-stone-600'
                  }`}
                >
                  <span className="text-xs font-bold">State-wide</span>
                  <span className="text-[10px] text-stone-400 font-medium mt-0.5">Visible to everyone in {stateLocation.name}</span>
                </button>
              )}

              {/* Option: Country */}
              {countryLocation && (
                <button
                  type="button"
                  onClick={() => {
                    setScopeMode('country')
                    setScopeDropdownOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-stone-50 transition-colors flex flex-col ${
                    scopeMode === 'country' ? 'bg-primary-50/10 text-primary-700' : 'text-stone-600'
                  }`}
                >
                  <span className="text-xs font-bold">Country-wide</span>
                  <span className="text-[10px] text-stone-400 font-medium mt-0.5">Visible to everyone in {countryLocation.name}</span>
                </button>
              )}

              {/* Option: Custom Area (Radius) */}
              <button
                type="button"
                onClick={() => {
                  setScopeMode('custom')
                  setScopeDropdownOpen(false)
                }}
                className={`w-full text-left px-4 py-2 hover:bg-stone-50 transition-colors flex flex-col ${
                  scopeMode === 'custom' ? 'bg-purple-50/10 text-purple-700' : 'text-stone-600'
                }`}
              >
                <span className="text-xs font-bold">By Area (Custom Radius)</span>
                <span className="text-[10px] text-stone-400 font-medium mt-0.5">Define a custom kilometer spread around your coordinates</span>
              </button>
            </div>
          )}
        </div>

        {/* Custom Radius Input */}
        {scopeMode === 'custom' && (
          <div className="p-3 bg-purple-50/40 border border-purple-100 rounded-lg space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <label className="block text-[10px] font-bold text-purple-700 uppercase tracking-wide">
              Define Spread Distance (in Kilometers)
            </label>
            <div className="flex items-center gap-2 max-w-[150px]">
              <input
                type="number"
                min={1}
                max={500}
                required
                value={customRadius}
                onChange={(e) => setCustomRadius(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-3 py-1.5 border border-purple-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold text-stone-850 shadow-sm"
              />
              <span className="text-sm font-semibold text-purple-700">km</span>
            </div>
            <p className="text-[10px] text-purple-500 font-semibold leading-relaxed">
              * This post will only be visible to residents residing within {customRadius} km of your location.
            </p>
          </div>
        )}

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
          {mediaUrl && (
            <div className="space-y-2 mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="relative w-max">
                <img 
                  src={mediaUrl} 
                  alt="Preview" 
                  className={`rounded-lg border border-stone-200 ${
                    imageFit === 'square' 
                      ? 'w-24 h-24 object-cover' 
                      : imageFit === 'contain'
                      ? 'w-40 h-24 object-contain bg-stone-100 p-1'
                      : 'w-40 h-22 object-cover' // default/cover landscape
                  }`}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-1.5 -right-1.5 bg-stone-850 text-white p-0.5 rounded-full hover:bg-stone-950 transition-colors flex items-center justify-center shadow-md"
                >
                  <X size={10} />
                </button>
              </div>

              {/* Fit Adjustment Buttons */}
              <div className="flex gap-2 items-center">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Image Style:</span>
                <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200/80">
                  {[
                    { id: 'cover',   label: 'Landscape (16:9)' },
                    { id: 'square',  label: 'Square (1:1)' },
                    { id: 'contain', label: 'Fit Full Image' }
                  ].map((fit) => (
                    <button
                      key={fit.id}
                      type="button"
                      onClick={() => setImageFit(fit.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                        imageFit === fit.id
                          ? 'bg-white text-stone-800 shadow-sm border border-stone-200/50 font-extrabold'
                          : 'text-stone-500 hover:text-stone-750'
                      }`}
                    >
                      {fit.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
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
        <div className="flex justify-between items-center pt-2">
          {/* Left Action: Photo Uploader & AI Correction */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              ref={fileInputRef}
              disabled={isSubmitting || uploadingImage || correctingText}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg flex items-center gap-1.5 transition-colors text-xs font-semibold"
              disabled={isSubmitting || uploadingImage || correctingText}
            >
              {uploadingImage ? (
                <Loader className="animate-spin" size={14} />
              ) : (
                <ImageIcon size={14} />
              )}
              Add Photo
            </button>

            <button
              type="button"
              onClick={handleAICorrect}
              className="px-3 py-2 text-purple-600 hover:text-purple-750 hover:bg-purple-50 rounded-lg flex items-center gap-1.5 transition-all text-xs font-bold border border-purple-100 bg-purple-50/30"
              disabled={isSubmitting || uploadingImage || correctingText || !body.trim()}
              title="Fix spelling and grammar using AI"
            >
              {correctingText ? (
                <Loader className="animate-spin text-purple-600" size={14} />
              ) : (
                <Sparkles size={14} />
              )}
              AI Fix Spelling
            </button>
          </div>

          {/* Right Actions: Cancel / Publish */}
          <div className="flex gap-3">
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
        </div>
      </form>
    </div>
  )
}