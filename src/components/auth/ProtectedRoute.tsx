import React, { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { checkSession } from '../../store/slices/authSlice'
import { PinVerify } from './PinVerify'

interface ProtectedRouteProps {
  children: React.ReactNode
  requirePin?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requirePin = false 
}) => {
  const dispatch = useAppDispatch()
  const { isAuthenticated, isPinSet } = useAppSelector(state => state.auth)

  useEffect(() => {
    dispatch(checkSession())
  }, [dispatch])

  if (requirePin && isPinSet && !isAuthenticated) {
    return <PinVerify onSuccess={() => {
      // Pin verification successful
    }} />
  }

  return <>{children}</>
}