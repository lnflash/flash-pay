import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  isAuthenticated: boolean
  isPinSet: boolean
  pinHash: string | null
  lastActivity: number | null
  sessionTimeout: number
  username: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  isPinSet: false,
  pinHash: null,
  lastActivity: null,
  sessionTimeout: 15 * 60 * 1000, // 15 minutes
  username: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPinHash: (state, action: PayloadAction<string>) => {
      state.pinHash = action.payload
      state.isPinSet = true
    },
    removePin: (state) => {
      state.pinHash = null
      state.isPinSet = false
      state.isAuthenticated = false
    },
    authenticate: (state) => {
      state.isAuthenticated = true
      state.lastActivity = Date.now()
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.lastActivity = null
    },
    updateActivity: (state) => {
      if (state.isAuthenticated) {
        state.lastActivity = Date.now()
      }
    },
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload
    },
    checkSession: (state) => {
      if (state.lastActivity && state.isAuthenticated) {
        const now = Date.now()
        if (now - state.lastActivity > state.sessionTimeout) {
          state.isAuthenticated = false
          state.lastActivity = null
        }
      }
    },
  },
})

export const {
  setPinHash,
  removePin,
  authenticate,
  logout,
  updateActivity,
  setUsername,
  checkSession,
} = authSlice.actions

export default authSlice.reducer