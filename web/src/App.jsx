// Root component. Handles:
// 1. Initial auth check on every page load (fetchMe using stored token)
// 2. Routing - public routes vs protected routes
// 3. Socket connection lifecycle (connect after login, disconnect on logout)

import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { fetchMe, selectIsAuthenticated, selectAuthLoading } from './redux/slices/authSlice'
import { fetchMyLocations } from './redux/slices/locationSlice'
import { connectSocket, disconnectSocket } from './services/socket'
import { notificationService } from './services/notificationService'

import LandingPage    from './pages/LandingPage'
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import FeedPage       from './pages/FeedPage'
import PostDetailPage from './pages/PostDetailPage'
import ProfilePage    from './pages/ProfilePage'
import CirclesPage    from './pages/CirclesPage'
import CircleChatPage from './pages/CircleChatPage'
import NotFoundPage   from './pages/NotFoundPage'
import AppShell       from './components/layout/AppShell'
import SplashScreen   from './components/common/SplashScreen'

function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isLoading       = useSelector(selectAuthLoading)
  if (isLoading)        return <SplashScreen />
  if (!isAuthenticated) return <Navigate to="/" replace />
  return children
}

function PublicRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isLoading       = useSelector(selectAuthLoading)
  if (isLoading)       return <SplashScreen />
  if (isAuthenticated) return <Navigate to="/feed" replace />
  return children
}

export default function App() {
  const dispatch        = useDispatch()
  const navigate        = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  // On first load: check stored token and fetch user profile
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      dispatch(fetchMe())
    } else {
      dispatch({ type: 'auth/setNotAuthenticated' })
    }
  }, [dispatch])

  // After auth: fetch locations and connect socket
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyLocations())
      connectSocket()
      // Request permission & subscribe to push notifications
      notificationService.init()
    } else {
      disconnectSocket()
    }
  }, [isAuthenticated, dispatch])

  // Listen to deep-link NAVIGATE messages from service worker click events
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event) => {
        if (event.data && event.data.type === 'NAVIGATE') {
          navigate(event.data.url)
        }
      };
      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
    }
  }, [navigate])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route element={
        <ProtectedRoute>
          <AppShell />
        </ProtectedRoute>
      }>
        <Route path="/feed"            element={<FeedPage />} />
        <Route path="/posts/:id"       element={<PostDetailPage />} />
        <Route path="/profile"         element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/circles"         element={<CirclesPage />} />
        <Route path="/circles/:id"     element={<CircleChatPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}