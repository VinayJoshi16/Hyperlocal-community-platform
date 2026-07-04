import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (email, { rejectWithValue }) => {
    try {
      const res = await authAPI.sendOtp(email)
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send OTP')
    }
  }
)

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, code, name }, { rejectWithValue }) => {
    try {
      const res = await authAPI.verifyOtp(email, code, name)
      const { accessToken, refreshToken, user, isNewUser } = res.data.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      return { user, isNewUser }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Invalid OTP')
    }
  }
)

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('refreshToken')
      if (!token) return rejectWithValue('No refresh token')

      const res = await authAPI.refresh(token)
      const { accessToken, refreshToken: newRefresh } = res.data.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', newRefresh)

      return { accessToken }
    } catch (err) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      return rejectWithValue('Session expired')
    }
  }
)

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authAPI.getMe()
      return res.data.data.user
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load profile')
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('refreshToken')
      if (token) await authAPI.logout(token)
    } catch (_) {
      // Ignore errors on logout - clean up locally regardless
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const res = await authAPI.updateMe(data)
      return res.data.data.user
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Update failed')
    }
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            null,
    isAuthenticated: false,
    isLoading:       true,
    otpSent:         false,
    otpEmail:        '',
    sendingOtp:      false,
    verifyingOtp:    false,
    error:           null,
  },
  reducers: {
    clearError(state) {
      state.error = null
    },
    clearOtpState(state) {
      state.otpSent  = false
      state.otpEmail = ''
      state.error    = null
    },
    setUser(state, action) {
      state.user            = action.payload
      state.isAuthenticated = true
      state.isLoading       = false
    },
    setNotAuthenticated(state) {
      state.user            = null
      state.isAuthenticated = false
      state.isLoading       = false
    },
  },
  extraReducers: (builder) => {
    // ── sendOtp ──
    builder
      .addCase(sendOtp.pending, (state) => {
        state.sendingOtp = true
        state.error      = null
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.sendingOtp = false
        state.otpSent    = true
        state.otpEmail   = action.meta.arg
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.sendingOtp = false
        state.error      = action.payload
        toast.error(action.payload)
      })

    // ── verifyOtp ──
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.verifyingOtp = true
        state.error        = null
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.verifyingOtp    = false
        state.user            = action.payload.user
        state.isAuthenticated = true
        state.otpSent         = false
        state.otpEmail        = ''
        if (action.payload.isNewUser) {
          toast.success('Welcome to NeighbourHub!')
        } else {
          toast.success('Signed in successfully.')
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.verifyingOtp = false
        state.error        = action.payload
        toast.error(action.payload)
      })

    // ── fetchMe ──
    builder
      .addCase(fetchMe.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user            = action.payload
        state.isAuthenticated = true
        state.isLoading       = false
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user            = null
        state.isAuthenticated = false
        state.isLoading       = false
      })

    // ── logout ──
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user            = null
        state.isAuthenticated = false
        state.otpSent         = false
        state.otpEmail        = ''
        toast.success('Logged out.')
      })

    // ── updateProfile ──
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload
        toast.success('Profile updated.')
      })
      .addCase(updateProfile.rejected, (_, action) => {
        toast.error(action.payload)
      })

    // ── refreshToken ──
    builder
      .addCase(refreshToken.rejected, (state) => {
        state.user            = null
        state.isAuthenticated = false
        state.isLoading       = false
      })
  },
})

export const { clearError, clearOtpState, setUser, setNotAuthenticated } = authSlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectUser            = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthLoading     = (state) => state.auth.isLoading
export const selectOtpSent         = (state) => state.auth.otpSent
export const selectOtpEmail        = (state) => state.auth.otpEmail
export const selectSendingOtp      = (state) => state.auth.sendingOtp
export const selectVerifyingOtp    = (state) => state.auth.verifyingOtp
export const selectAuthError       = (state) => state.auth.error

export default authSlice.reducer