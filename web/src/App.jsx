// Root component. Handles:
// 1. Initial auth check on every page load (fetchMe using stored token)
// 2. Routing - public routes vs protected routes
// 3. Socket connection lifecycle (connect after login, disconnect on logout)

import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { fetchMe, selectIsAuthenticated, selectAuthLoading } from './redux/slices/authSlice'
import { fetchMyLocations, selectNeedsLocation } from './redux/slices/locationSlice'
import { connectSocket, disconnectSocket } from './services/socket'

import LoginPage      from './pages/LoginPage'
import FeedPage       from './pages/FeedPage'
import PostDetailPage from './pages/PostDetailPage'
import ProfilePage    from './pages/ProfilePage'
import OnboardingPage from './pages/OnboardingPage'
import NotFoundPage   from './pages/NotFoundPage'
import AppShell       from './components/layout/AppShell'
import SplashScreen   from './components/common/SplashScreen'

function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isLoading       = useSelector(selectAuthLoading)
  if (isLoading)        return <SplashScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
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
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const needsLocation   = useSelector(selectNeedsLocation)

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
    } else {
      disconnectSocket()
    }
  }, [isAuthenticated, dispatch])

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path="/" element={
        <ProtectedRoute>
          {needsLocation ? <Navigate to="/onboarding" replace /> : <AppShell />}
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/feed" replace />} />
        <Route path="feed"            element={<FeedPage />} />
        <Route path="posts/:id"       element={<PostDetailPage />} />
        <Route path="profile"         element={<ProfilePage />} />
        <Route path="profile/:userId" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}