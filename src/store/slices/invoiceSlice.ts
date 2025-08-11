import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Invoice {
  paymentRequest: string
  paymentHash: string
  amount: number
  memo?: string
  expiresAt: number
  createdAt: number
  status: 'pending' | 'paid' | 'expired' | 'cancelled'
}

interface InvoiceState {
  currentInvoice: Invoice | null
  invoiceHistory: Invoice[]
  isGenerating: boolean
  error: string | null
}

const initialState: InvoiceState = {
  currentInvoice: null,
  invoiceHistory: [],
  isGenerating: false,
  error: null,
}

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    setCurrentInvoice: (state, action: PayloadAction<Invoice>) => {
      state.currentInvoice = action.payload
      state.error = null
    },
    clearCurrentInvoice: (state) => {
      if (state.currentInvoice) {
        state.invoiceHistory.unshift(state.currentInvoice)
      }
      state.currentInvoice = null
    },
    updateInvoiceStatus: (state, action: PayloadAction<Invoice['status']>) => {
      if (state.currentInvoice) {
        state.currentInvoice.status = action.payload
      }
    },
    setGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    addToHistory: (state, action: PayloadAction<Invoice>) => {
      state.invoiceHistory.unshift(action.payload)
    },
    clearHistory: (state) => {
      state.invoiceHistory = []
    },
  },
})

export const {
  setCurrentInvoice,
  clearCurrentInvoice,
  updateInvoiceStatus,
  setGenerating,
  setError,
  addToHistory,
  clearHistory,
} = invoiceSlice.actions

export default invoiceSlice.reducer