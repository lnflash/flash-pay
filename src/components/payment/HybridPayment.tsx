import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material'
import { QrCode, Nfc } from '@mui/icons-material'
import { NFCReader } from './NFCReader'
import { QRScanner } from './QRScanner'
import { styled } from '@mui/material/styles'

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}))

interface HybridPaymentProps {
  onPaymentData: (data: string) => void
  isActive: boolean
}

export const HybridPayment: React.FC<HybridPaymentProps> = ({
  onPaymentData,
  isActive,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'nfc'>('qr')

  const handleMethodChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMethod: 'qr' | 'nfc' | null,
  ) => {
    if (newMethod !== null) {
      setPaymentMethod(newMethod)
    }
  }

  const handlePaymentData = (data: string) => {
    // Process the payment data
    // Check if it's a Lightning invoice or LNURL
    if (data.toLowerCase().startsWith('lightning:')) {
      onPaymentData(data.substring(10))
    } else if (data.toLowerCase().startsWith('lnurl')) {
      onPaymentData(data)
    } else {
      onPaymentData(data)
    }
  }

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h5" gutterBottom>
        Payment Method
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Choose how the customer will pay
      </Typography>

      <ToggleButtonGroup
        value={paymentMethod}
        exclusive
        onChange={handleMethodChange}
        fullWidth
        sx={{ my: 2 }}
      >
        <StyledToggleButton value="qr">
          <Box display="flex" alignItems="center" gap={1}>
            <QrCode />
            <Typography>QR Code</Typography>
          </Box>
        </StyledToggleButton>
        
        <StyledToggleButton value="nfc">
          <Box display="flex" alignItems="center" gap={1}>
            <Nfc />
            <Typography>NFC Tap</Typography>
          </Box>
        </StyledToggleButton>
      </ToggleButtonGroup>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ minHeight: 300 }}>
        {paymentMethod === 'qr' ? (
          <QRScanner 
            onScan={handlePaymentData}
            isActive={isActive}
          />
        ) : (
          <NFCReader
            onRead={handlePaymentData}
            isActive={isActive}
          />
        )}
      </Box>

      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Supported Payment Methods:</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div">
          • Lightning Network invoices
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div">
          • LNURL-pay compatible wallets
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div">
          • NFC-enabled Flash cards (Android Chrome only)
        </Typography>
      </Box>
    </Paper>
  )
}