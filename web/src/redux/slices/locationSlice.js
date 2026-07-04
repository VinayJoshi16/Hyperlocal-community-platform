import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { locationAPI } from '../../services/api'
import toast from 'react-hot-toast'

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const fetchMyLocations = createAsyncThunk(
  'location/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const res = await locationAPI.getMyLocations()
      return res.data.data.locations
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load locations')
    }
  }
)

export const setLocationFromGPS = createAsyncThunk(
  'location/setFromGPS',
  async ({ lat, lng }, { rejectWithValue }) => {
    try {
      const res = await locationAPI.setLocation(lat, lng)
      return res.data.data.hierarchy
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Could not resolve your location')
    }
  }
)

export const searchLocations = createAsyncThunk(
  'location/search',
  async (query, { rejectWithValue }) => {
    try {
      const res = await locationAPI.search(query)
      return res.data.data.results
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Search failed')
    }
  }
)

export const joinLocation = createAsyncThunk(
  'location/join',
  async (locationId, { rejectWithValue }) => {
    try {
      const res = await locationAPI.join(locationId)
      return res.data.data.location
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Could not join location')
    }
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

const locationSlice = createSlice({
  name: 'location',
  initialState: {
    myLocations:       [],
    activeLocation:    null,
    searchResults:     [],
    isLoading:         false,
    isSettingLocation: false,
    isSearching:       false,
    error:             null,
    needsLocation:     false,
  },
  reducers: {
    setActiveLocation(state, action) {
      state.activeLocation = action.payload
    },
    clearSearchResults(state) {
      state.searchResults = []
    },
    setNeedsLocation(state, action) {
      state.needsLocation = action.payload
    },
  },
  extraReducers: (builder) => {
    // ── fetchMyLocations ──
    builder
      .addCase(fetchMyLocations.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchMyLocations.fulfilled, (state, action) => {
        state.isLoading     = false
        state.myLocations   = action.payload
        state.needsLocation = action.payload.length === 0

        if (action.payload.length > 0 && !state.activeLocation) {
          state.activeLocation =
            action.payload.find((l) => l.is_primary) || action.payload[0]
        }
      })
      .addCase(fetchMyLocations.rejected, (state, action) => {
        state.isLoading = false
        state.error     = action.payload
      })

    // ── setLocationFromGPS ──
    builder
      .addCase(setLocationFromGPS.pending, (state) => {
        state.isSettingLocation = true
        state.error             = null
      })
      .addCase(setLocationFromGPS.fulfilled, (state, action) => {
        state.isSettingLocation = false
        state.myLocations       = action.payload
        state.needsLocation     = false
        if (action.payload.length > 0) {
          state.activeLocation = action.payload[0]
        }
        toast.success('Location set successfully.')
      })
      .addCase(setLocationFromGPS.rejected, (state, action) => {
        state.isSettingLocation = false
        state.error             = action.payload
        toast.error(action.payload)
      })

    // ── searchLocations ──
    builder
      .addCase(searchLocations.pending, (state) => {
        state.isSearching = true
      })
      .addCase(searchLocations.fulfilled, (state, action) => {
        state.isSearching   = false
        state.searchResults = action.payload
      })
      .addCase(searchLocations.rejected, (state) => {
        state.isSearching = false
      })

    // ── joinLocation ──
    builder
      .addCase(joinLocation.fulfilled, (state, action) => {
        const exists = state.myLocations.find((l) => l.id === action.payload.id)
        if (!exists) {
          state.myLocations.unshift({ ...action.payload, is_primary: true })
        }
        state.activeLocation = action.payload
        state.needsLocation  = false
        toast.success(`Joined ${action.payload.name}.`)
      })
      .addCase(joinLocation.rejected, (_, action) => {
        toast.error(action.payload)
      })
  },
})

export const {
  setActiveLocation,
  clearSearchResults,
  setNeedsLocation,
} = locationSlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectMyLocations     = (state) => state.location.myLocations
export const selectActiveLocation  = (state) => state.location.activeLocation
export const selectSearchResults   = (state) => state.location.searchResults
export const selectLocationLoading = (state) => state.location.isLoading
export const selectSettingLocation = (state) => state.location.isSettingLocation
export const selectIsSearching     = (state) => state.location.isSearching
export const selectNeedsLocation   = (state) => state.location.needsLocation

export default locationSlice.reducer