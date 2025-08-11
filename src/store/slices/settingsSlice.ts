import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface SettingsState {
  displayCurrency: string
  language: string
  theme: 'light' | 'dark'
  soundEnabled: boolean
  vibrationEnabled: boolean
  autoLogoutTime: number
  developerMode: boolean
  showFiatAmount: boolean
  defaultMemo: string
}

const initialState: SettingsState = {
  displayCurrency: 'JMD',
  language: 'en',
  theme: 'light',
  soundEnabled: true,
  vibrationEnabled: true,
  autoLogoutTime: 15,
  developerMode: false,
  showFiatAmount: true,
  defaultMemo: '',
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setDisplayCurrency: (state, action: PayloadAction<string>) => {
      state.displayCurrency = action.payload
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled
    },
    toggleVibration: (state) => {
      state.vibrationEnabled = !state.vibrationEnabled
    },
    setAutoLogoutTime: (state, action: PayloadAction<number>) => {
      state.autoLogoutTime = action.payload
    },
    toggleDeveloperMode: (state) => {
      state.developerMode = !state.developerMode
    },
    toggleShowFiatAmount: (state) => {
      state.showFiatAmount = !state.showFiatAmount
    },
    setDefaultMemo: (state, action: PayloadAction<string>) => {
      state.defaultMemo = action.payload
    },
    resetSettings: () => initialState,
  },
})

export const {
  setDisplayCurrency,
  setLanguage,
  setTheme,
  toggleSound,
  toggleVibration,
  setAutoLogoutTime,
  toggleDeveloperMode,
  toggleShowFiatAmount,
  setDefaultMemo,
  resetSettings,
} = settingsSlice.actions

export default settingsSlice.reducer