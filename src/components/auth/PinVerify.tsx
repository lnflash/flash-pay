import React, { useState } from 'react'
import { Box, Typography, Button, Alert } from '@mui/material'
import { PinPad } from './PinPad'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { authenticate, logout } from '../../store/slices/authSlice'
import { hashPin } from '../../utils/crypto'

interface PinVerifyProps {
  onSuccess: () => void
  onCancel?: () => void
  title?: string
}

export const PinVerify: React.FC<PinVerifyProps> = ({ 
  onSuccess, 
  onCancel,
  title = "Enter Your PIN"
}) => {
  const dispatch = useAppDispatch()
  const { pinHash } = useAppSelector(state => state.auth)
  const [error, setError] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)

  const MAX_ATTEMPTS = 3
  const LOCKOUT_TIME = 30000 // 30 seconds

  const handlePinSubmit = async (pin: string) => {
    const hashedInput = await hashPin(pin)
    
    if (hashedInput === pinHash) {
      dispatch(authenticate())
      setAttempts(0)
      onSuccess()
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setError(true)
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setLocked(true)
        dispatch(logout())
        
        setTimeout(() => {
          setLocked(false)
          setAttempts(0)
        }, LOCKOUT_TIME)
      }
    }
  }

  if (locked) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 2 }}>
        <Alert severity="error" sx={{ maxWidth: 400, mx: 'auto' }}>
          Too many incorrect attempts. Please wait 30 seconds before trying again.
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 2 }}>
      {attempts > 0 && (
        <Alert severity="warning" sx={{ maxWidth: 400, mx: 'auto', mb: 2 }}>
          Incorrect PIN. {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts !== 1 ? 's' : ''} remaining.
        </Alert>
      )}

      <PinPad
        title={title}
        onComplete={handlePinSubmit}
        error={error}
        onError={() => setError(false)}
      />

      {onCancel && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button onClick={onCancel} variant="text" color="secondary">
            Cancel
          </Button>
        </Box>
      )}
    </Box>
  )
}