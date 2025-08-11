import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface PosState {
  currentAmount: string
  displayCurrency: string
  walletCurrency: string
  isProcessing: boolean
}

const initialState: PosState = {
  currentAmount: '',
  displayCurrency: 'JMD',
  walletCurrency: 'USD',
  isProcessing: false,
}

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    setAmount: (state, action: PayloadAction<string>) => {
      state.currentAmount = action.payload
    },
    clearAmount: (state) => {
      state.currentAmount = ''
    },
    appendDigit: (state, action: PayloadAction<string>) => {
      if (action.payload === '.' && state.currentAmount.includes('.')) {
        return
      }
      state.currentAmount = state.currentAmount + action.payload
    },
    deleteLastDigit: (state) => {
      state.currentAmount = state.currentAmount.slice(0, -1)
    },
    setDisplayCurrency: (state, action: PayloadAction<string>) => {
      state.displayCurrency = action.payload
    },
    setWalletCurrency: (state, action: PayloadAction<string>) => {
      state.walletCurrency = action.payload
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload
    },
  },
})

export const {
  setAmount,
  clearAmount,
  appendDigit,
  deleteLastDigit,
  setDisplayCurrency,
  setWalletCurrency,
  setProcessing,
} = posSlice.actions

export default posSlice.reducer