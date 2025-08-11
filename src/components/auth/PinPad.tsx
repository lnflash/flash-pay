import React, { useState, useEffect } from 'react'
import { Box, Grid, IconButton, Typography, Paper } from '@mui/material'
import { Backspace, FiberManualRecord } from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const PinButton = styled(IconButton)(({ theme }) => ({
  width: 80,
  height: 80,
  fontSize: '24px',
  fontWeight: 600,
  borderRadius: '50%',
  backgroundColor: theme.palette.background.paper,
  border: `2px solid ${theme.palette.divider}`,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    transform: 'scale(1.05)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
  transition: 'all 0.2s ease',
}))

const PinDot = styled(Box)(({ theme, filled }: { theme?: any; filled: boolean }) => ({
  width: 16,
  height: 16,
  borderRadius: '50%',
  border: `2px solid ${theme.palette.text.primary}`,
  backgroundColor: filled ? theme.palette.text.primary : 'transparent',
  margin: '0 8px',
  transition: 'all 0.2s ease',
}))

interface PinPadProps {
  title: string
  onComplete: (pin: string) => void
  maxLength?: number
  error?: boolean
  onError?: () => void
}

export const PinPad: React.FC<PinPadProps> = ({
  title,
  onComplete,
  maxLength = 4,
  error = false,
  onError,
}) => {
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)

  useEffect(() => {
    if (pin.length === maxLength) {
      onComplete(pin)
    }
  }, [pin, maxLength, onComplete])

  useEffect(() => {
    if (error) {
      setShake(true)
      setTimeout(() => {
        setPin('')
        setShake(false)
        onError?.()
      }, 500)
      
      if (navigator.vibrate) {
        navigator.vibrate(200)
      }
    }
  }, [error, onError])

  const handleDigitPress = (digit: string) => {
    if (pin.length < maxLength) {
      setPin(pin + digit)
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }
  }

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1))
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }
  }

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 400,
        mx: 'auto',
        mt: 4,
        animation: shake ? 'shake 0.5s' : 'none',
        '@keyframes shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
        },
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        {title}
      </Typography>

      <Box display="flex" justifyContent="center" my={4}>
        {Array.from({ length: maxLength }).map((_, index) => (
          <PinDot key={index} filled={index < pin.length} />
        ))}
      </Box>

      <Grid container spacing={2} justifyContent="center">
        {digits.slice(0, 9).map((digit) => (
          <Grid item xs={4} key={digit}>
            <Box display="flex" justifyContent="center">
              <PinButton onClick={() => handleDigitPress(digit)}>
                {digit}
              </PinButton>
            </Box>
          </Grid>
        ))}
        
        <Grid item xs={4}>
          <Box display="flex" justifyContent="center">
            <Box sx={{ width: 80, height: 80 }} />
          </Box>
        </Grid>
        
        <Grid item xs={4}>
          <Box display="flex" justifyContent="center">
            <PinButton onClick={() => handleDigitPress('0')}>0</PinButton>
          </Box>
        </Grid>
        
        <Grid item xs={4}>
          <Box display="flex" justifyContent="center">
            <PinButton onClick={handleDelete}>
              <Backspace />
            </PinButton>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}