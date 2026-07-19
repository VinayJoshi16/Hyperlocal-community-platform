// Socket.io client. Connects to the backend, joins location rooms,
// and dispatches incoming real-time events directly into the Redux store.
// Call connect() after login, disconnect() on logout.

import { io } from 'socket.io-client'
import { store } from '../redux/store'
import { addNewPost, setEmergencyAlert } from '../redux/slices/feedSlice'
import { resolveMediaUrl } from '../utils/mediaUrl'

function normalizePostMedia(post) {
  if (!post || typeof post !== 'object') return post
  return {
    ...post,
    media_urls: post.media_urls?.map(resolveMediaUrl),
    video_urls: post.video_urls?.map(resolveMediaUrl),
    file_urls: post.file_urls?.map(resolveMediaUrl),
    author_avatar: resolveMediaUrl(post.author_avatar),
  }
}

const BACKEND_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') 
  : 'https://neighbourhub-backend.onrender.com'

const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:5000' : BACKEND_URL

let socket = null

export function connectSocket() {
  if (socket?.connected) return socket

  const token = localStorage.getItem('accessToken')
  if (!token) return null

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  })

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id)
    const state       = store.getState()
    const locationIds = state.location.myLocations.map((l) => l.id)
    if (locationIds.length > 0) {
      socket.emit('join_locations', { locationIds })
    }
  })

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason)
  })

  socket.on('connect_error', (err) => {
    console.warn('Socket connection error:', err.message)
  })

  // New post arrived in one of the user's communities
  socket.on('new_post', (post) => {
    store.dispatch(addNewPost(normalizePostMedia(post)))
  })

  // Emergency alert - shown as full banner + added to feed
  socket.on('emergency_alert', (post) => {
    const normalized = normalizePostMedia(post)
    store.dispatch(setEmergencyAlert(normalized))
    store.dispatch(addNewPost(normalized))
  })

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function joinLocationRooms(locationIds) {
  if (socket?.connected && locationIds.length > 0) {
    socket.emit('join_locations', { locationIds })
  }
}

export function leaveLocationRoom(locationId) {
  if (socket?.connected) {
    socket.emit('leave_location', { locationId })
  }
}

export function getSocket() {
  return socket
}