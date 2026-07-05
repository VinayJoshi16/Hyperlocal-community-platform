import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import App from './App'
import { store } from './redux/store'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
        {/* Global toast notifications - warm styling to match our palette */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#292524',
              color: '#fafaf9',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              borderRadius: '10px',
              padding: '12px 16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#fafaf9' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fafaf9' },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)