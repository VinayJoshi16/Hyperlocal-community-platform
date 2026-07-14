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

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">

      {/* Emergency alert banner sits above everything */}
      {emergency && (
        <EmergencyBanner
          post={emergency}
          onDismiss={() => dispatch(dismissEmergencyAlert())}
        />
      )}

      <Navbar />
      <AppTour />

      <div className="flex flex-1 w-full max-w-app mx-auto px-6 lg:px-10 gap-8 pt-6 pb-12">

        {/* Left sidebar - desktop only */}
        <aside className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
          <div className="sticky top-20">
            <Sidebar />
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-30 lg:hidden"
              onClick={() => dispatch(closeSidebar())}
            />
            <div className="fixed top-0 left-0 h-full w-64 bg-white z-40 shadow-modal
                            lg:hidden flex flex-col pt-16 px-4 animate-slideUp">
              <Sidebar />
            </div>
          </>
        )}

        {/* Pages render here */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>

      </div>
    </div>
  )
}