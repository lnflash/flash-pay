import React, { useMemo } from 'react'
import { Box, Paper, Typography, Chip } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useAppSelector } from '../../store/hooks'
import { useSatPrice } from '../../hooks/useSatPrice'
import { formatCurrency } from '../../utils/currency'

const DisplayContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
  },
}))

const AmountText = styled(Typography)(({ theme }) => ({
  fontSize: '3rem',
  fontWeight: 700,
  lineHeight: 1.2,
  [theme.breakpoints.down('sm')]: {
    fontSize: '2.5rem',
  },
}))

const ConversionText = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  opacity: 0.9,
  marginTop: theme.spacing(1),
}))

export const AmountDisplay: React.FC = () => {
  const { currentAmount, displayCurrency } = useAppSelector(state => state.pos)
  const { convertToSats, convertFromSats, loading } = useSatPrice(displayCurrency)

  const displayAmount = useMemo(() => {
    if (!currentAmount) return '0'
    const num = parseFloat(currentAmount)
    if (isNaN(num)) return '0'
    return formatCurrency(num, displayCurrency)
  }, [currentAmount, displayCurrency])

  const satsAmount = useMemo(() => {
    if (!currentAmount || loading) return null
    const num = parseFloat(currentAmount)
    if (isNaN(num) || num === 0) return null
    
    const sats = convertToSats(num)
    return sats ? `≈ ${sats.toLocaleString()} sats` : null
  }, [currentAmount, convertToSats, loading])

  const usdAmount = useMemo(() => {
    if (!currentAmount || loading || displayCurrency === 'USD') return null
    const num = parseFloat(currentAmount)
    if (isNaN(num) || num === 0) return null
    
    const sats = convertToSats(num)
    if (!sats) return null
    
    const usd = convertFromSats(sats, 'USD')
    return usd ? `≈ ${formatCurrency(usd, 'USD')}` : null
  }, [currentAmount, convertToSats, convertFromSats, loading, displayCurrency])

  return (
    <DisplayContainer elevation={3}>
      <Box position="relative" zIndex={1}>
        <Chip 
          label={displayCurrency}
          size="small"
          sx={{ 
            mb: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'inherit',
          }}
        />
        
        <AmountText>
          {displayAmount}
        </AmountText>
        
        {satsAmount && (
          <ConversionText>
            {satsAmount}
          </ConversionText>
        )}
        
        {usdAmount && (
          <ConversionText variant="body2">
            {usdAmount}
          </ConversionText>
        )}
      </Box>
    </DisplayContainer>
  )
}