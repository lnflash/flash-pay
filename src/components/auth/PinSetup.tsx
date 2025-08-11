import React, { useState } from 'react'
import { Box, Typography, Button, Alert } from '@mui/material'
import { PinPad } from './PinPad'
import { useAppDispatch } from '../../store/hooks'
import { setPinHash, authenticate } from '../../store/slices/authSlice'
import { hashPin } from '../../utils/crypto'

interface PinSetupProps {
  onComplete: () => void
}

export const PinSetup: React.FC<PinSetupProps> = ({ onComplete }) => {
  const dispatch = useAppDispatch()
  const [step, setStep] = useState<'create' | 'confirm'>('create')
  const [firstPin, setFirstPin] = useState('')
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleFirstPin = (pin: string) => {
    setFirstPin(pin)
    setStep('confirm')
  }

  const handleConfirmPin = async (pin: string) => {
    if (pin === firstPin) {
      const hashedPin = await hashPin(pin)
      dispatch(setPinHash(hashedPin))
      dispatch(authenticate())
      onComplete()
    } else {
      setError(true)
      setErrorMessage('PINs do not match. Please try again.')
      setTimeout(() => {
        setStep('create')
        setFirstPin('')
        setError(false)
        setErrorMessage('')
      }, 2000)
    }
  }

  const handleCancel = () => {
    setStep('create')
    setFirstPin('')
    setError(false)
    setErrorMessage('')
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 2 }}>
      {errorMessage && (
        <Alert severity="error" sx={{ maxWidth: 400, mx: 'auto', mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {step === 'create' ? (
        <PinPad
          title="Create Your PIN"
          onComplete={handleFirstPin}
          error={error}
          onError={() => setError(false)}
        />
      ) : (
        <>
          <PinPad
            title="Confirm Your PIN"
            onComplete={handleConfirmPin}
            error={error}
            onError={() => setError(false)}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button onClick={handleCancel} variant="text" color="secondary">
              Start Over
            </Button>
          </Box>
        </>
      )}

      <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 4 }}>
        Your PIN will be used to access settings and sensitive features
      </Typography>
    </Box>
  )
}