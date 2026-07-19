// Central API client. All HTTP calls go through here.
// The axios interceptor automatically attaches the JWT to every request
// and handles token refresh when a 401 is received.

import axios from 'axios'
import { resolveMediaUrl } from '../utils/mediaUrl'

const BASE_URL = import.meta.env.DEV 
  ? '' 
  : (import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') 
      : 'https://neighbourhub-backend.onrender.com')

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Automatically prepend '/api' to all endpoint paths if not already present
    if (config.url && config.url.startsWith('/') && !config.url.startsWith('/api')) {
      config.url = '/api' + config.url
    }
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const activeLocationId = localStorage.getItem('activeLocationId')
    if (activeLocationId) {
      config.headers['X-Active-Location-Id'] = activeLocationId
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor ─────────────────────────────────────────────────────
// On 401 (token expired), try to refresh once then retry the original request.
let isRefreshing = false
let failedQueue  = []

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else       prom.resolve(token)
  })
  failedQueue = []
}

function resolveUploadUrls(data) {
  if (!data) return data;
  
  if (typeof data === 'string') {
    return resolveMediaUrl(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(resolveUploadUrls);
  }
  
  if (typeof data === 'object') {
    const copy = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        copy[key] = resolveUploadUrls(data[key]);
      }
    }
    return copy;
  }
  
  return data;
}

api.interceptors.response.use(
  (response) => {
    response.data = resolveUploadUrls(response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing           = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')

        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        const { accessToken, refreshToken: newRefresh } = res.data.data

        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', newRefresh)

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`
        processQueue(null, accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export const authAPI = {
  sendOtp:  (email)              => api.post('/auth/send-otp', { email }),
  verifyOtp:(email, code, name)  => api.post('/auth/verify-otp', { email, code, name }),
  register: (data)               => api.post('/auth/register', data),
  verifyRegistration: (email, code) => api.post('/auth/verify-registration', { email, code }),
  login:    (email, password)    => api.post('/auth/login', { email, password }),
  refresh:  (refreshToken)       => api.post('/auth/refresh', { refreshToken }),
  logout:   (refreshToken)       => api.post('/auth/logout', { refreshToken }),
  logoutAll:()                   => api.post('/auth/logout-all'),
  getMe:    ()                   => api.get('/auth/me'),
  updateMe: (data)               => api.patch('/auth/me', data),
}

// ─── Location API ─────────────────────────────────────────────────────────────
export const locationAPI = {
  setLocation:    (lat, lng) => api.post('/location/set', { lat, lng }),
  resolveGPS:     (lat, lng) => api.post('/location/resolve-gps', { lat, lng }),
  getMyLocations: ()         => api.get('/location/mine'),
  search:         (q)        => api.get('/location/search', { params: { q } }),
  getChildren:    (id)       => api.get(`/location/${id}/children`),
  join:           (id)       => api.post(`/location/join/${id}`),
  updatePrimary:  (locationId) => api.post('/location/update-primary', { locationId }),
}

// ─── Posts API ────────────────────────────────────────────────────────────────
export const postsAPI = {
  getFeed:          ({ limit, before } = {}) =>
    api.get('/posts/feed', { params: { limit, before } }),
  getPost:          (id)    => api.get(`/posts/${id}`),
  createPost:       (data)  => api.post('/posts', data),
  uploadImage:      (formData) => api.post('/posts/upload', formData, { headers: { 'Content-Type': undefined } }),
  correctGrammar:   (text)  => api.post('/posts/correct-grammar', { text }),
  aiRewrite:        (title, body, type) => api.post('/posts/ai-rewrite', { title, body, type }),
  translate:        (id, targetLanguage) => api.post(`/posts/${id}/translate`, { targetLanguage }),
  getMatches:       (id)    => api.get(`/posts/${id}/matches`),
  generatePoll:     (topic) => api.post('/posts/generate-poll', { topic }),
  deletePost:       (id)    => api.delete(`/posts/${id}`),
  togglePin:        (id)    => api.patch(`/posts/${id}/pin`),
  getUserPosts:     (userId, { limit, before } = {}) =>
    api.get(`/posts/user/${userId}`, { params: { limit, before } }),
  getLocationPosts: (locationId, type, { limit, before } = {}) =>
    api.get(`/posts/location/${locationId}`, { params: { type, limit, before } }),
  getComments:      (postId)              => api.get(`/posts/${postId}/comments`),
  addComment:       (postId, body, parentId) =>
    api.post(`/posts/${postId}/comments`, { body, parentId }),
  deleteComment:    (postId, commentId)   => api.delete(`/posts/${postId}/comments/${commentId}`),
  react:            (postId, emoji)       => api.post(`/posts/${postId}/react`, { emoji }),
  vote:             (postId, optionIndex) => api.post(`/posts/${postId}/vote`, { optionIndex }),
  rsvp:             (postId)              => api.post(`/posts/${postId}/rsvp`),
}

export const circlesAPI = {
  getCircles:         ()                   => api.get('/circles'),
  createCircle:       (data)               => api.post('/circles', data),
  getCircleDetails:   (id)                 => api.get(`/circles/${id}`),
  join:               (id)                 => api.post(`/circles/${id}/join`),
  updateSettings:     (id, data)           => api.patch(`/circles/${id}/settings`, data),
  getMessages:        (id)                 => api.get(`/circles/${id}/messages`),
  postMessage:        (id, message)        => api.post(`/circles/${id}/messages`, { message }),
  markMessagesViewed: (id, messageIds)     => api.post(`/circles/${id}/messages/view`, { messageIds }),
  deleteMessage:      (id, messageId)      => api.delete(`/circles/${id}/messages/${messageId}`),
  
  getPins:            (id)                 => api.get(`/circles/${id}/pins`),
  addPin:             (id, content)        => api.post(`/circles/${id}/pins`, { content }),
  deletePin:          (id, pinId)          => api.delete(`/circles/${id}/pins/${pinId}`),

  getPolls:           (id)                 => api.get(`/circles/${id}/polls`),
  createPoll:         (id, question, options) => api.post(`/circles/${id}/polls`, { question, options }),
  votePoll:           (id, pollId, optionIndex) => api.post(`/circles/${id}/polls/${pollId}/vote`, { optionIndex }),
  deletePoll:         (id, pollId)         => api.delete(`/circles/${id}/polls/${pollId}`),

  getEvents:          (id)                 => api.get(`/circles/${id}/events`),
  createEvent:        (id, eventData)      => api.post(`/circles/${id}/events`, eventData),
  toggleEvent:        (id, eventId)        => api.post(`/circles/${id}/events/${eventId}/toggle`),
  deleteEvent:        (id, eventId)        => api.delete(`/circles/${id}/events/${eventId}`),

  searchUsers:        (q)                  => api.get('/circles/users/search', { params: { q } }),
  addMember:          (id, targetUserId)   => api.post(`/circles/${id}/members`, { targetUserId }),
  
  getJoinRequests:    (id)                 => api.get(`/circles/${id}/requests`),
  handleJoinRequest:  (id, targetUserId, action) => api.post(`/circles/${id}/requests/${targetUserId}`, { action }),

  updateName:         (id, name)           => api.patch(`/circles/${id}/name`, { name }),
  updateImage:        (id, image_url)      => api.patch(`/circles/${id}/image`, { image_url }),
  updateDescription:  (id, description)    => api.patch(`/circles/${id}/description`, { description }),
  promoteAdmin:       (id, userId)         => api.post(`/circles/${id}/admins`, { userId }),
  demoteAdmin:        (id, userId)         => api.delete(`/circles/${id}/admins/${userId}`),
  transferOwnership:  (id, userId)         => api.post(`/circles/${id}/transfer-owner`, { userId }),
  deleteCircle:       (id)                 => api.delete(`/circles/${id}`),
  removeMember:       (id, userId)         => api.delete(`/circles/${id}/members/${userId}`),
  deleteMessageAdmin: (id, messageId)      => api.delete(`/circles/${id}/messages/${messageId}/admin`),
}

export const notificationsAPI = {
  getVapidPublicKey: () => api.get('/notifications/vapid-public-key'),
  subscribe: (data) => api.post('/notifications/subscribe', data),
  unsubscribe: (endpoint) => api.post('/notifications/unsubscribe', { endpoint }),
}

export default api