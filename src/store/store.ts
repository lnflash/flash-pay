import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import createWebStorage from 'redux-persist/lib/storage/createWebStorage'

// Create a noop storage for SSR
const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null)
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value)
    },
    removeItem(_key: string) {
      return Promise.resolve()
    },
  }
}

const storage = typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage()

import posReducer from './slices/posSlice'
import authReducer from './slices/authSlice'
import invoiceReducer from './slices/invoiceSlice'
import transactionReducer from './slices/transactionSlice'
import settingsReducer from './slices/settingsSlice'

const rootReducer = combineReducers({
  pos: posReducer,
  auth: authReducer,
  invoice: invoiceReducer,
  transaction: transactionReducer,
  settings: settingsReducer,
})

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'settings', 'transaction'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }) as any,
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch