import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import feedReducer from './slices/feedSlice'
import locationReducer from './slices/locationSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    feed:     feedReducer,
    location: locationReducer,
    ui:       uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Socket.io instances are not serializable - tell Redux to ignore them
      serializableCheck: {
        ignoredActions: ['auth/setSocket'],
        ignoredPaths:   ['auth.socket'],
      },
    }),
})

export const getState = () => store.getState()
export const dispatch = (action) => store.dispatch(action)