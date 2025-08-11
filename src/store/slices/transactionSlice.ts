import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Transaction {
  id: string
  amount: number
  displayAmount: number
  displayCurrency: string
  memo?: string
  status: 'pending' | 'completed' | 'failed'
  type: 'payment' | 'invoice'
  createdAt: string
  completedAt?: string
  paymentHash?: string
  paymentRequest?: string
}

interface TransactionState {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  filter: {
    status?: Transaction['status']
    type?: Transaction['type']
    dateFrom?: string
    dateTo?: string
  }
}

const initialState: TransactionState = {
  transactions: [],
  isLoading: false,
  error: null,
  filter: {},
}

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload)
    },
    updateTransaction: (state, action: PayloadAction<Partial<Transaction> & { id: string }>) => {
      const index = state.transactions.findIndex(tx => tx.id === action.payload.id)
      if (index !== -1) {
        state.transactions[index] = { ...state.transactions[index], ...action.payload }
      }
    },
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setFilter: (state, action: PayloadAction<TransactionState['filter']>) => {
      state.filter = action.payload
    },
    clearFilter: (state) => {
      state.filter = {}
    },
  },
})

export const {
  addTransaction,
  updateTransaction,
  setTransactions,
  setLoading,
  setError,
  setFilter,
  clearFilter,
} = transactionSlice.actions

export default transactionSlice.reducer