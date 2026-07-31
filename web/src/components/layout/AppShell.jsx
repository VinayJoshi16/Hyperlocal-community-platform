import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { selectSidebarOpen, closeSidebar } from '../../redux/slices/uiSlice'
import { selectEmergencyAlert, dismissEmergencyAlert } from '../../redux/slices/feedSlice'

import Navbar          from './Navbar'
import Sidebar         from './Sidebar'
import EmergencyBanner from '../common/EmergencyBanner'
import AppTour         from '../common/AppTour'

export default function AppShell() {
  const dispatch    = useDispatch()
  const sidebarOpen = useSelector(selectSidebarOpen)
  const emergency   = useSelector(selectEmergencyAlert)
  const location    = useLocation()

  // Close mobile sidebar on route change
  useEffect(() => {
    dispatch(closeSidebar())
  }, [location.pathname, dispatch])

  // Lock body scroll when mobile sidebar is open to prevent background scrolling
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [sidebarOpen])

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-transparent flex flex-col">

      {/* Emergency alert banner sits above everything */}
      {emergency && (
        <EmergencyBanner
          post={emergency}
          onDismiss={() => dispatch(dismissEmergencyAlert())}
        />
      )}

      <Navbar />
      <AppTour />

      <div className="flex flex-1 min-h-0 w-full px-4 sm:px-6 lg:px-8 xl:px-10 gap-6 sm:gap-8 pt-6 pb-6 lg:pb-4 lg:overflow-hidden">

        {/* Left sidebar - desktop only */}
        <aside className="hidden lg:flex lg:w-[260px] xl:w-[280px] flex-shrink-0 bg-white border border-stone-200/90 rounded-3xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] max-h-full min-h-0 overflow-y-auto overscroll-contain scrollbar-hide">
          <Sidebar />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-30 lg:hidden"
              onClick={() => dispatch(closeSidebar())}
            />
            <div className="fixed top-0 left-0 h-full w-64 bg-white z-40 shadow-modal
                            lg:hidden flex flex-col pt-16 px-4 overflow-y-auto overscroll-contain scrollbar-hide animate-slideUp">
              <Sidebar />
            </div>
          </>
        )}

        {/* Pages render here - scrolls natively at document level on mobile, internal scroll on desktop */}
        <main className="flex-1 min-w-0 min-h-0 lg:overflow-hidden lg:overflow-y-auto lg:overscroll-contain overflow-y-visible flex flex-col">
          <Outlet />
        </main>

      </div>
    </div>
  )
}