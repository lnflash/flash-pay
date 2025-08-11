import React from 'react'
import { Box, Grid, IconButton, Paper, Typography } from '@mui/material'
import { Backspace, Check } from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { appendDigit, deleteLastDigit, clearAmount } from '../../store/slices/posSlice'

const NumPadButton = styled(IconButton)(({ theme }) => ({
  width: '100%',
  height: 80,
  fontSize: '28px',
  fontWeight: 600,
  borderRadius: 12,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'scale(1.02)',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
  transition: 'all 0.1s ease',
  [theme.breakpoints.down('sm')]: {
    height: 70,
    fontSize: '24px',
  },
}))

const ActionButton = styled(NumPadButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}))

const DeleteButton = styled(NumPadButton)(({ theme }) => ({
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.error.main,
  },
}))

interface NumPadProps {
  onSubmit: () => void
  maxAmount?: number
}

export const NumPad: React.FC<NumPadProps> = ({ onSubmit, maxAmount = 1000000 }) => {
  const dispatch = useAppDispatch()
  const { currentAmount } = useAppSelector(state => state.pos)

  const handleDigit = (digit: string) => {
    const newAmount = currentAmount + digit
    
    // Validate amount
    if (digit === '.' && currentAmount.includes('.')) return
    if (currentAmount.includes('.')) {
      const decimals = currentAmount.split('.')[1]
      if (decimals.length >= 2) return
    }
    
    const numericValue = parseFloat(newAmount)
    if (numericValue > maxAmount) return
    
    dispatch(appendDigit(digit))
    
    if (navigator.vibrate) {
      navigator.vibrate(30)
    }
  }

  const handleDelete = () => {
    dispatch(deleteLastDigit())
    if (navigator.vibrate) {
      navigator.vibrate(30)
    }
  }

  const handleClear = () => {
    dispatch(clearAmount())
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  const handleSubmit = () => {
    if (currentAmount && parseFloat(currentAmount) > 0) {
      onSubmit()
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50])
      }
    }
  }

  const digits = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['.', '0', 'delete'],
  ]

  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
      <Grid container spacing={1.5}>
        {digits.map((row, rowIndex) => (
          <Grid item xs={12} key={rowIndex}>
            <Grid container spacing={1.5}>
              {row.map((digit) => (
                <Grid item xs={4} key={digit}>
                  {digit === 'delete' ? (
                    <DeleteButton onClick={handleDelete} onDoubleClick={handleClear}>
                      <Backspace />
                    </DeleteButton>
                  ) : (
                    <NumPadButton onClick={() => handleDigit(digit)}>
                      {digit}
                    </NumPadButton>
                  )}
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))}
        
        <Grid item xs={12}>
          <ActionButton 
            onClick={handleSubmit}
            disabled={!currentAmount || parseFloat(currentAmount) <= 0}
            fullWidth
          >
            <Check sx={{ mr: 1 }} />
            Charge
          </ActionButton>
        </Grid>
      </Grid>
    </Paper>
  )
}