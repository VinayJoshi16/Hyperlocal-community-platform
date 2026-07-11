import { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Megaphone, Calendar, Search, Briefcase, 
  BarChart2, AlertTriangle, FileText, Plus, X, Loader,
  Image as ImageIcon, Sparkles, ChevronDown, Paperclip, 
  Home, Globe, MapPin, MessageSquare, Send, Users
} from 'lucide-react'
import toast from 'react-hot-toast'

import { createPost } from '../../redux/slices/feedSlice'
import { selectActiveLocation, selectMyLocations } from '../../redux/slices/locationSlice'
import { selectUser } from '../../redux/slices/authSlice'
import { selectCreatePostOpen, setCreatePostOpen } from '../../redux/slices/uiSlice'
import { postsAPI } from '../../services/api'

const POST_TYPES = [
  { type: 'announcement', label: 'Update',       icon: Megaphone,     roles: ['user', 'admin', 'business', 'moderator'] },
  { type: 'event',        label: 'Event',        icon: Calendar,      roles: ['user', 'admin', 'business', 'moderator'] },
  { type: 'lost_found',   label: 'Lost & Found', icon: Search,        roles: ['user', 'admin', 'business', 'moderator'] },
  { type: 'poll',         label: 'Poll',         icon: BarChart2,     roles: ['user', 'admin', 'business', 'moderator'] },
  { type: 'business',     label: 'Business',     icon: Briefcase,     roles: ['business', 'admin'] },
  { type: 'notice',       label: 'Notice',       icon: FileText,      roles: ['admin'] },
  { type: 'emergency',    label: 'Emergency',    icon: AlertTriangle, roles: ['user', 'admin', 'business', 'moderator'] },
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

  // Multi-media uploads specific fields
  const [mediaUrls, setMediaUrls] = useState([])
  const [videoUrls, setVideoUrls] = useState([])
  const [fileUrls, setFileUrls] = useState([])
  const [uploading, setUploading] = useState(false)

  const photoInputRef = useRef(null)
  const docInputRef = useRef(null)

  const handleFileUpload = async (e, uploadType) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    const toastId = toast.loading(`Uploading ${uploadType}...`)
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('image', file) // Generic upload route expects key name 'image'
        
        const res = await postsAPI.uploadImage(formData)
        if (res.data.success) {
          const url = res.data.url
          if (uploadType === 'photo') {
            setMediaUrls(prev => [...prev, url])
          } else if (uploadType === 'video') {
            setVideoUrls(prev => [...prev, url])
          } else if (uploadType === 'file') {
            setFileUrls(prev => [...prev, url])
          }
        }
      }
      toast.success(`${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} uploaded!`, { id: toastId })
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to upload ${uploadType}`, { id: toastId })
    } finally {
      setUploading(false)
      if (e.target) e.target.value = '' // clear input
    }
  }

  const handleRemovePhoto = (idx) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== idx))
  }
  const handleRemoveVideo = (idx) => {
    setVideoUrls(prev => prev.filter((_, i) => i !== idx))
  }
  const handleRemoveFile = (idx) => {
    setFileUrls(prev => prev.filter((_, i) => i !== idx))
  }

  const getImageFit = (url) => {
    if (url.endsWith('#contain')) return 'contain'
    if (url.endsWith('#square')) return 'square'
    return 'cover'
  }

  const setImageFit = (idx, fitMode) => {
    setMediaUrls(prev => prev.map((url, i) => {
      if (i !== idx) return url
      const cleanUrl = url.split('#')[0]
      if (fitMode === 'cover') return cleanUrl
      return `${cleanUrl}#${fitMode}`
    }))
  }

  // AI Spelling & Grammar / Rewrite fields
  const [correctingText, setCorrectingText] = useState(false)
  const [aiRewriteCount, setAiRewriteCount] = useState(0)

  const handleAIRewrite = async () => {
    if (!body.trim()) {
      toast.error('Please enter some text in the body to polish.')
      return
    }

    setCorrectingText(true)
    const toastId = toast.loading('Polishing draft with AI...')
    try {
      const res = await postsAPI.aiRewrite(title, body, type)
      if (res.data.success && res.data.data) {
        if (res.data.data.title !== undefined) {
          setTitle(res.data.data.title)
        }
        if (res.data.data.body !== undefined) {
          setBody(res.data.data.body)
        }
        setAiRewriteCount(prev => prev + 1)
        toast.success('Draft polished by AI!', { id: toastId })
      }
    } catch (err) {
      toast.error('Failed to polish draft with AI.', { id: toastId })
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
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      videoUrls: videoUrls.length > 0 ? videoUrls : undefined,
      fileUrls: fileUrls.length > 0 ? fileUrls : undefined,
      aiRewriteCount,
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
        setMediaUrls([])
        setVideoUrls([])
        setFileUrls([])
        setScopeMode('local')
        setCustomRadius(5)
        setAiRewriteCount(0)
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
        className="bg-white border border-stone-200/80 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] cursor-pointer hover:border-stone-300 transition-all flex items-center gap-3 px-4 py-3 mb-6 hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
      >
        <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200/60 text-stone-700 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="text-stone-400 text-xs font-semibold flex-1 text-left select-none">
          Share something with your neighborhood...
        </div>
        <div className="flex gap-1">
          <button className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-all">
            <Calendar size={16} />
          </button>
          <button className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-all">
            <BarChart2 size={16} />
          </button>
        </div>
      </div>
    )
  }

  // Expanded form dynamic color theme mapping
  const CARD_THEMES = {
    announcement: { bg: 'bg-stone-50/40 border-stone-200/90',   accent: 'text-stone-850' },
    event:        { bg: 'bg-emerald-50/30 border-emerald-200/70', accent: 'text-emerald-800' },
    lost_found:   { bg: 'bg-purple-50/30 border-purple-200/70',   accent: 'text-purple-800' },
    poll:         { bg: 'bg-indigo-50/30 border-indigo-200/70',   accent: 'text-indigo-800' },
    business:     { bg: 'bg-amber-50/30 border-amber-250/70',     accent: 'text-amber-800' },
    notice:       { bg: 'bg-blue-50/30 border-blue-200/70',       accent: 'text-blue-800' },
    emergency:    { bg: 'bg-red-50/40 border-red-200/90',         accent: 'text-red-800' }
  }

  const theme = CARD_THEMES[type] || CARD_THEMES.announcement

  return (
    <div className={`card p-6 border rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-300 mb-6 ${theme.bg}`}>
      {/* ─── Header Section (Matching reference mockup) ─── */}
      <div className="flex justify-between items-start mb-4">
        <div className="text-left">
          <h3 className={`text-[17px] font-extrabold transition-colors duration-300 ${theme.accent}`}>
            Create Neighborhood Post
          </h3>
          <p className="text-xs text-stone-400 font-medium mt-0.5 select-none leading-relaxed">
            Share updates, events and announcements with your community
          </p>
        </div>
        <button 
          onClick={() => dispatch(setCreatePostOpen(false))} 
          className="text-stone-400 hover:text-stone-700 p-1.5 hover:bg-stone-50 rounded-full transition-all"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* ─── Post Type Selector Tabs ─── */}
        <div className="flex flex-wrap gap-1.5 pb-2.5 border-b border-stone-100 mb-2.5">
          {availableTypes.map((t) => {
            const isSelected = type === t.type
            const Icon = t.icon
            return (
              <button
                key={t.type}
                type="button"
                onClick={() => setType(t.type)}
                className={`flex items-center gap-1.5 px-3.5 py-1.8 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                  isSelected
                    ? t.type === 'emergency' 
                      ? 'bg-red-600 text-white border-red-600 font-bold shadow-sm'
                      : 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/25 font-bold shadow-sm'
                    : 'bg-white text-stone-550 border-stone-200/80 hover:border-stone-300 hover:bg-stone-50/50'
                }`}
              >
                <Icon size={13} className={isSelected ? t.type === 'emergency' ? 'text-white' : 'text-[#2563EB]' : 'text-stone-400'} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* ─── Post Visibility / Audience Selector ─── */}
        <div className="space-y-1.5 text-left relative">
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest select-none">
            <Users size={12} className="text-stone-400/80" />
            Audience
          </label>
          <button
            type="button"
            onClick={() => setScopeDropdownOpen(!scopeDropdownOpen)}
            className="w-full flex items-center justify-between p-3.5 border border-stone-200/80 rounded-xl bg-[#FAFAF9]/30 hover:bg-stone-50/50 hover:border-stone-300 transition-all text-left shadow-sm"
          >
            <div className="flex items-center gap-3 truncate pr-4">
              <div className="w-9 h-9 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 shadow-sm flex-shrink-0">
                <Home size={16} className="stroke-[2.5]" />
              </div>
              <div className="truncate">
                <h4 className="text-xs font-bold text-stone-850">
                  {scopeMode === 'local' && `Local Neighborhood (${activeLocation?.name || 'Garden City Society'})`}
                  {scopeMode === 'city' && `City-wide (${cityLocation?.name || 'City'})`}
                  {scopeMode === 'state' && `State-wide (${stateLocation?.name || 'State'})`}
                  {scopeMode === 'country' && `Country-wide (${countryLocation?.name || 'Country'})`}
                  {scopeMode === 'custom' && `Custom Area (${customRadius} km Radius)`}
                </h4>
                <p className="text-[10px] text-stone-400 font-semibold mt-0.5 truncate leading-normal">
                  {scopeMode === 'local' && "Post to school, society, or next door and interact with standard users."}
                  {scopeMode === 'city' && `Post to everyone residing in ${cityLocation?.name || 'your city'}`}
                  {scopeMode === 'state' && `Post to everyone residing in ${stateLocation?.name || 'your state'}`}
                  {scopeMode === 'country' && `Post to everyone residing in ${countryLocation?.name || 'your country'}`}
                  {scopeMode === 'custom' && `Post to everyone residing within ${customRadius} km of your location`}
                </p>
              </div>
            </div>
            <ChevronDown size={15} className={`text-stone-400 flex-shrink-0 transition-transform duration-200 ${scopeDropdownOpen ? 'rotate-180' : ''}`} />
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
          <div className="p-3.5 bg-purple-50/40 border border-purple-100 rounded-xl space-y-2 text-left animate-in fade-in slide-in-from-top-1 duration-200">
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

        {/* ─── Title Section ─── */}
        <div className="space-y-1.5 text-left">
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest select-none">
            <FileText size={12} className="text-stone-400/80" />
            Give your post a title (optional)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Enter a short, clear title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 pr-14 border border-stone-200/80 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 bg-[#FAFAF9]/50 focus:bg-white transition-all placeholder:text-stone-400"
              maxLength={80}
            />
            <span className="absolute right-3.5 bottom-2.5 text-[9px] font-bold text-stone-400 select-none">
              {title.length} / 80
            </span>
          </div>
        </div>

        {/* ─── Description / Content Area ─── */}
        <div className="space-y-1.5 text-left">
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest select-none">
            <MessageSquare size={12} className="text-stone-400/80" />
            What's happening in your neighborhood?
          </label>
          
          <div className="border border-stone-200/80 rounded-xl bg-white focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-100 transition-all overflow-hidden relative">
            <textarea
              required
              rows={4}
              placeholder={
                type === 'emergency' 
                  ? 'Describe the emergency details and instructions clearly...' 
                  : 'Share updates, ask questions, report issues, or start a discussion...'
              }
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3.5 py-3 border-0 rounded-t-xl text-xs font-medium focus:outline-none focus:ring-0 bg-transparent placeholder:text-stone-400 resize-none min-h-[100px]"
              maxLength={2000}
            />
            
            {/* Inline Sub-toolbar */}
            <div className="flex items-center justify-between px-3 py-2 bg-stone-50/50 border-t border-stone-150 select-none">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-stone-550 hover:text-stone-850 hover:bg-stone-100 rounded-lg text-[10px] font-bold transition-all"
                >
                  <ImageIcon size={13} className="text-stone-450" />
                  Add Photos
                </button>
                <button
                  type="button"
                  onClick={() => toast.success('Location is automatically tagged to your registered community.')}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-stone-550 hover:text-stone-850 hover:bg-stone-100 rounded-lg text-[10px] font-bold transition-all"
                >
                  <MapPin size={13} className="text-stone-450" />
                  Location
                </button>
                <button
                  type="button"
                  onClick={() => toast.success('Add hashtags inside the post description to tag topics.')}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-stone-550 hover:text-stone-850 hover:bg-stone-100 rounded-lg text-[10px] font-bold transition-all"
                >
                  <Users size={13} className="text-stone-450" />
                  Tags
                </button>
              </div>
              <span className="text-[9px] font-bold text-stone-450 pr-1.5">
                {body.length} / 2000
              </span>
            </div>
          </div>
        </div>

        {/* ─── Media & Attachments Previews (Notion style) ─── */}
        {(mediaUrls.length > 0 || videoUrls.length > 0 || fileUrls.length > 0) && (
          <div className="p-3.5 bg-stone-50/60 border border-stone-150 rounded-xl space-y-3 text-left">
            <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-1.5">
              Attached Content ({mediaUrls.length + videoUrls.length + fileUrls.length})
            </h4>
            
            {/* Images Previews with Adjustment Controls */}
            {mediaUrls.length > 0 && (
              <div className="flex flex-col gap-2.5 pb-1 border-b border-stone-100/50">
                {mediaUrls.map((url, idx) => {
                  const currentFit = getImageFit(url)
                  const cleanUrl = url.split('#')[0]
                  return (
                    <div key={idx} className="flex items-center gap-3 p-2.5 border border-stone-200 rounded-xl bg-white shadow-sm relative group">
                      {/* Image Thumbnail */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-stone-150 flex-shrink-0 bg-stone-50/50 flex items-center justify-center select-none">
                        <img 
                          src={cleanUrl} 
                          alt="Preview" 
                          className={`w-full h-full ${
                            currentFit === 'contain' ? 'object-contain p-1' : 'object-cover'
                          } ${currentFit === 'square' ? 'aspect-square' : ''}`} 
                        />
                      </div>
                      
                      {/* Aspect Ratio controls */}
                      <div className="flex-1 text-left space-y-1 min-w-0">
                        <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider select-none">Image Fit</span>
                        <div className="flex flex-wrap gap-1.5 select-none">
                          {['cover', 'contain', 'square'].map((fit) => (
                            <button
                              key={fit}
                              type="button"
                              onClick={() => setImageFit(idx, fit)}
                              className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all border ${
                                currentFit === fit
                                  ? 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/25 font-extrabold shadow-sm'
                                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                              }`}
                            >
                              {fit}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="text-stone-400 hover:text-red-500 hover:bg-stone-55/60 p-1.5 rounded-lg transition-all flex-shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Videos Previews */}
            {videoUrls.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {videoUrls.map((url, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 border border-stone-200 rounded-xl bg-white text-xs font-semibold text-stone-700">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                      <span className="truncate">Attached Video ({idx + 1})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVideo(idx)}
                      className="text-stone-400 hover:text-red-500 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Files Previews */}
            {fileUrls.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {fileUrls.map((url, idx) => {
                  const filename = url.substring(url.lastIndexOf('-') + 1) || url.substring(url.lastIndexOf('/') + 1);
                  return (
                    <div key={idx} className="flex items-center justify-between p-2.5 border border-stone-200 rounded-xl bg-white text-xs font-semibold text-stone-750">
                      <div className="flex items-center gap-2.5 truncate">
                        <Paperclip size={13} className="text-stone-450 flex-shrink-0" />
                        <span className="truncate">{filename}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="text-stone-400 hover:text-red-500 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Dynamic Fields for EVENTS */}
        {type === 'event' && (
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-3 text-left">
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
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-3 text-left">
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

        {/* ─── Submit Actions (Matching reference mockup footer) ─── */}
        <div className="flex items-center justify-between gap-x-4 gap-y-3.5 pt-3.5 flex-wrap">
          
          {/* Invisible inputs for file upload triggers */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'photo')}
            className="hidden"
            ref={photoInputRef}
            multiple
          />
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,video/*"
            onChange={(e) => handleFileUpload(e, e.target.files[0]?.type.startsWith('video/') ? 'video' : 'file')}
            className="hidden"
            ref={docInputRef}
            multiple
          />

          {/* Left Action: Attachments & AI Corrector */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="h-9 px-3 border border-stone-200/80 hover:border-stone-300 bg-white hover:bg-stone-50/50 rounded-lg flex items-center gap-1.5 transition-colors text-xs font-semibold text-stone-600 hover:text-stone-850"
              disabled={isSubmitting || uploading}
            >
              {uploading ? (
                <Loader className="animate-spin text-stone-400" size={14} />
              ) : (
                <ImageIcon size={14} className="text-stone-450" />
              )}
              Add Photos
            </button>

            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              className="h-9 px-3 border border-stone-200/80 hover:border-stone-300 bg-white hover:bg-stone-50/50 rounded-lg flex items-center gap-1.5 transition-colors text-xs font-semibold text-stone-600 hover:text-stone-850"
              disabled={isSubmitting || uploading}
            >
              <Paperclip size={14} className="text-stone-450" />
              Attach File
            </button>

            <button
              type="button"
              onClick={handleAIRewrite}
              className="h-9 px-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg flex items-center gap-1.5 transition-all text-xs font-bold shadow-sm"
              disabled={isSubmitting || uploading || correctingText || !body.trim()}
              title="Polishes spelling, structure, and tone using AI"
            >
              {correctingText ? (
                <Loader className="animate-spin text-white" size={14} />
              ) : (
                <Sparkles size={14} />
              )}
              AI Polish
            </button>
          </div>

          {/* Right Actions: Cancel / Publish */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch(setCreatePostOpen(false))}
              className="h-9 px-4 border border-stone-200/85 bg-white hover:bg-stone-50/50 hover:border-stone-300 rounded-lg text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className={`h-9 px-5 text-white shadow-sm font-extrabold text-xs rounded-lg flex items-center gap-1.5 transition-all duration-300 ${
                type === 'emergency' ? 'bg-red-650 hover:bg-red-750 shadow-md' :
                type === 'event' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md' :
                type === 'lost_found' ? 'bg-purple-600 hover:bg-purple-700 shadow-md' :
                type === 'poll' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md' :
                type === 'business' ? 'bg-[#F59E0B] hover:bg-amber-600 shadow-md' :
                type === 'notice' ? 'bg-blue-600 hover:bg-blue-700 shadow-md' :
                'bg-[#2563EB] hover:bg-[#1D4ED8]'
              }`}
              disabled={isSubmitting || !body.trim() || uploading}
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin" size={14} />
                  Publishing...
                </>
              ) : (
                <>
                  {type === 'emergency' ? 'Publish Alert' : 'Publish Post'}
                  <Send size={12} className="ml-0.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}