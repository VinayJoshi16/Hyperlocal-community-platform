import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { postsAPI } from '../../services/api'
import toast from 'react-hot-toast'

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async ({ limit = 20, before = null, lat = null, lng = null } = {}, { rejectWithValue }) => {
    try {
      const res = await postsAPI.getFeed({ limit, before, lat, lng })
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load feed')
    }
  }
)

export const createPost = createAsyncThunk(
  'feed/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const res = await postsAPI.createPost(postData)
      return res.data.data.post
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create post')
    }
  }
)

export const deletePost = createAsyncThunk(
  'feed/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await postsAPI.deletePost(postId)
      return postId
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete post')
    }
  }
)

export const reactToPost = createAsyncThunk(
  'feed/reactToPost',
  async ({ postId, emoji = 'like' }, { rejectWithValue }) => {
    try {
      const res = await postsAPI.react(postId, emoji)
      return { postId, ...res.data.data }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to react')
    }
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

const feedSlice = createSlice({
  name: 'feed',
  initialState: {
    posts:          [],
    nextCursor:     null,
    hasMore:        true,
    isLoading:      false,
    isLoadingMore:  false,
    isCreating:     false,
    error:          null,
    emergencyAlert: null,
  },
  reducers: {
    addNewPost(state, action) {
      const exists = state.posts.find((p) => p.id === action.payload.id)
      if (!exists) {
        state.posts.unshift(action.payload)
      }
    },
    setEmergencyAlert(state, action) {
      state.emergencyAlert = action.payload
    },
    dismissEmergencyAlert(state) {
      state.emergencyAlert = null
    },
    clearFeed(state) {
      state.posts      = []
      state.nextCursor = null
      state.hasMore    = true
    },
  },
  extraReducers: (builder) => {
    // ── fetchFeed ──
    builder
      .addCase(fetchFeed.pending, (state, action) => {
        if (action.meta.arg?.before) {
          state.isLoadingMore = true
        } else {
          state.isLoading = true
          state.error     = null
        }
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        const { posts, nextCursor } = action.payload
        const isLoadMore = !!action.meta.arg?.before

        if (isLoadMore) {
          state.posts         = [...state.posts, ...posts]
          state.isLoadingMore = false
        } else {
          state.posts     = posts
          state.isLoading = false
        }

        state.nextCursor = nextCursor
        state.hasMore    = !!nextCursor
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading     = false
        state.isLoadingMore = false
        state.error         = action.payload
      })

    // ── createPost ──
    builder
      .addCase(createPost.pending, (state) => {
        state.isCreating = true
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isCreating = false
        state.posts.unshift(action.payload)
        toast.success('Post shared with your community.')
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isCreating = false
        toast.error(action.payload)
      })

    // ── deletePost ──
    builder
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p.id !== action.payload)
        toast.success('Post deleted.')
      })
      .addCase(deletePost.rejected, (_, action) => {
        toast.error(action.payload)
      })

    // ── reactToPost ──
    builder
      .addCase(reactToPost.fulfilled, (state, action) => {
        const { postId, action: reactionAction, reactions } = action.payload
        const post = state.posts.find((p) => p.id === postId)
        if (post) {
          post.has_reacted    = reactionAction === 'added'
          post.reaction_count = reactions.reduce((sum, r) => sum + r.count, 0)
        }
      })
  },
})

export const {
  addNewPost,
  setEmergencyAlert,
  dismissEmergencyAlert,
  clearFeed,
} = feedSlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectPosts          = (state) => state.feed.posts
export const selectFeedLoading    = (state) => state.feed.isLoading
export const selectLoadingMore    = (state) => state.feed.isLoadingMore
export const selectHasMore        = (state) => state.feed.hasMore
export const selectNextCursor     = (state) => state.feed.nextCursor
export const selectIsCreating     = (state) => state.feed.isCreating
export const selectEmergencyAlert = (state) => state.feed.emergencyAlert

export default feedSlice.reducer