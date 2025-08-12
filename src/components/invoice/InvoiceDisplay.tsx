import React, { useEffect, useState } from 'react'
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton,
  Chip,
  CircularProgress,
  Button,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import {
  ContentCopy,
  Share,
  CheckCircle,
  Cancel,
  ArrowBack,
  QrCode2,
  Nfc,
} from '@mui/icons-material'
import QRCode from 'react-qr-code'
import { useAppSelector } from '../../store/hooks'
import { formatCurrency } from '../../utils/currency'
import { NFCReader } from '../payment/NFCReader'
import copy from 'copy-to-clipboard'
import toast from 'react-hot-toast'

interface InvoiceDisplayProps {
  invoice: {
    paymentRequest: string
    amount: number
    memo?: string
    expiresAt: number
    status: 'pending' | 'paid' | 'expired' | 'cancelled'
  }
  onBack: () => void
  onPaymentComplete?: () => void
}

export const InvoiceDisplay: React.FC<InvoiceDisplayProps> = ({
  invoice,
  onBack,
  onPaymentComplete,
}) => {
  const { displayCurrency } = useAppSelector(state => state.settings)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [qrSize, setQrSize] = useState(250)
  const [displayMode, setDisplayMode] = useState<'qr' | 'nfc'>('qr')

  useEffect(() => {
    const updateQrSize = () => {
      const width = window.innerWidth
      if (width < 400) setQrSize(200)
      else if (width < 600) setQrSize(250)
      else setQrSize(300)
    }
    
    updateQrSize()
    window.addEventListener('resize', updateQrSize)
    return () => window.removeEventListener('resize', updateQrSize)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(0, invoice.expiresAt - now)
      setTimeLeft(Math.floor(remaining / 1000))
      
      if (remaining === 0 && invoice.status === 'pending') {
        // Handle expiration
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [invoice.expiresAt, invoice.status])

  useEffect(() => {
    if (invoice.status === 'paid' && onPaymentComplete) {
      setTimeout(onPaymentComplete, 1500)
    }
  }, [invoice.status, onPaymentComplete])

  const handleCopy = () => {
    if (copy(invoice.paymentRequest)) {
      toast.success('Invoice copied to clipboard!')
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lightning Invoice',
          text: `Pay ${formatCurrency(invoice.amount, displayCurrency)} via Lightning`,
          url: `lightning:${invoice.paymentRequest}`,
        })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      handleCopy()
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = () => {
    switch (invoice.status) {
      case 'paid': return 'success'
      case 'expired': return 'error'
      case 'cancelled': return 'warning'
      default: return 'info'
    }
  }

  const getStatusIcon = () => {
    switch (invoice.status) {
      case 'paid': return <CheckCircle />
      case 'expired':
      case 'cancelled': return <Cancel />
      default: return null
    }
  }

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, maxWidth: 500, mx: 'auto' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <IconButton onClick={onBack} edge="start">
          <ArrowBack />
        </IconButton>
        
        <Chip
          label={invoice.status.toUpperCase()}
          color={getStatusColor()}
          icon={getStatusIcon() || undefined}
          size="small"
        />
      </Box>

      <Typography variant="h4" align="center" gutterBottom>
        {formatCurrency(invoice.amount, displayCurrency)}
      </Typography>

      {invoice.memo && (
        <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
          {invoice.memo}
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      {invoice.status === 'pending' && (
        <>
          <Box display="flex" justifyContent="center" mb={2}>
            <ToggleButtonGroup
              value={displayMode}
              exclusive
              onChange={(_, newMode) => newMode && setDisplayMode(newMode)}
              size="small"
            >
              <ToggleButton value="qr">
                <QrCode2 sx={{ mr: 1 }} />
                QR Code
              </ToggleButton>
              <ToggleButton value="nfc">
                <Nfc sx={{ mr: 1 }} />
                NFC Tap
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {displayMode === 'qr' ? (
            <>
              <Box display="flex" justifyContent="center" my={3}>
                <Box 
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'white',
                    borderRadius: 2,
                    display: 'inline-block',
                  }}
                >
                  <QRCode
                    value={`lightning:${invoice.paymentRequest}`}
                    size={qrSize}
                    level="M"
                  />
                </Box>
              </Box>

              <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
                Scan QR code to pay with Lightning
              </Typography>
            </>
          ) : (
            <Box my={2}>
              <NFCReader
                onRead={(data) => {
                  // Handle NFC payment data
                  console.log('NFC data received:', data)
                }}
                isActive={true}
              />
            </Box>
          )}

          <Box display="flex" justifyContent="center" gap={2} my={2}>
            <Button
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={handleCopy}
            >
              Copy
            </Button>
            
            {navigator.share && (
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={handleShare}
              >
                Share
              </Button>
            )}
          </Box>

          <Box display="flex" alignItems="center" justifyContent="center" mt={2}>
            <Typography variant="body2" color="text.secondary">
              Expires in: {formatTime(timeLeft)}
            </Typography>
          </Box>
        </>
      )}

      {invoice.status === 'paid' && (
        <Box textAlign="center" py={4}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" color="success.main">
            Payment Received!
          </Typography>
        </Box>
      )}

      {(invoice.status === 'expired' || invoice.status === 'cancelled') && (
        <Box textAlign="center" py={4}>
          <Cancel sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" color="error.main">
            Invoice {invoice.status}
          </Typography>
        </Box>
      )}
    </Paper>
  )
}