// Central API client. All HTTP calls go through here.
// The axios interceptor automatically attaches the JWT to every request
// and handles token refresh when a 401 is received.

import axios from 'axios'

const BASE_URL = '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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

api.interceptors.response.use(
  (response) => response,
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
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  sendOtp:  (email)              => api.post('/auth/send-otp', { email }),
  verifyOtp:(email, code, name)  => api.post('/auth/verify-otp', { email, code, name }),
  refresh:  (refreshToken)       => api.post('/auth/refresh', { refreshToken }),
  logout:   (refreshToken)       => api.post('/auth/logout', { refreshToken }),
  logoutAll:()                   => api.post('/auth/logout-all'),
  getMe:    ()                   => api.get('/auth/me'),
  updateMe: (data)               => api.patch('/auth/me', data),
}

// ─── Location API ─────────────────────────────────────────────────────────────
export const locationAPI = {
  setLocation:    (lat, lng) => api.post('/location/set', { lat, lng }),
  getMyLocations: ()         => api.get('/location/mine'),
  search:         (q)        => api.get('/location/search', { params: { q } }),
  getChildren:    (id)       => api.get(`/location/${id}/children`),
  join:           (id)       => api.post(`/location/join/${id}`),
}

// ─── Posts API ────────────────────────────────────────────────────────────────
export const postsAPI = {
  getFeed:          ({ limit, before } = {}) =>
    api.get('/posts/feed', { params: { limit, before } }),
  getPost:          (id)    => api.get(`/posts/${id}`),
  createPost:       (data)  => api.post('/posts', data),
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

export default api