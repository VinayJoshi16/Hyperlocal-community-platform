import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    // Sidebar open on mobile
    sidebarOpen: false,

    // Which modal is currently open (null = none)
    // Values: 'createPost' | 'locationPicker' | 'postDetail' | null
    activeModal: null,

    // Data passed to the active modal (e.g. post ID for postDetail)
    modalData: null,

    // Active filter on the feed
    // Values: 'all' | 'announcement' | 'event' | 'lost_found' | 'business' | 'poll' | 'emergency'
    feedFilter: 'all',

    // Whether the create post panel is expanded
    createPostOpen: false,
  },
  reducers: {
    openModal(state, action) {
      state.activeModal = action.payload.modal
      state.modalData   = action.payload.data || null
    },
    closeModal(state) {
      state.activeModal = null
      state.modalData   = null
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    closeSidebar(state) {
      state.sidebarOpen = false
    },
    setFeedFilter(state, action) {
      state.feedFilter = action.payload
    },
    setCreatePostOpen(state, action) {
      state.createPostOpen = action.payload
    },
  },
})

export const {
  openModal,
  closeModal,
  toggleSidebar,
  closeSidebar,
  setFeedFilter,
  setCreatePostOpen,
} = uiSlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectActiveModal    = (state) => state.ui.activeModal
export const selectModalData      = (state) => state.ui.modalData
export const selectSidebarOpen    = (state) => state.ui.sidebarOpen
export const selectFeedFilter     = (state) => state.ui.feedFilter
export const selectCreatePostOpen = (state) => state.ui.createPostOpen

export default uiSlice.reducer