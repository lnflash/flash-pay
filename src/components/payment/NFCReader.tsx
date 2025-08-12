import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Paper, 
  Typography, 
  Button,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material'
import { 
  Nfc,
  QrCode,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material'
import toast from 'react-hot-toast'

interface NFCReaderProps {
  onRead: (data: string) => void
  isActive: boolean
}

export const NFCReader: React.FC<NFCReaderProps> = ({ onRead, isActive }) => {
  const [isNFCSupported, setIsNFCSupported] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRead, setLastRead] = useState<string | null>(null)

  useEffect(() => {
    // Check for Web NFC API support
    if ('NDEFReader' in window) {
      setIsNFCSupported(true)
    }
  }, [])

  useEffect(() => {
    if (isActive && isNFCSupported) {
      startNFCReader()
    } else {
      stopNFCReader()
    }

    return () => {
      stopNFCReader()
    }
  }, [isActive, isNFCSupported])

  const startNFCReader = async () => {
    if (!('NDEFReader' in window)) {
      setError('NFC is not supported on this device')
      return
    }

    try {
      const ndef = new (window as any).NDEFReader()
      setIsReading(true)
      setError(null)
      
      await ndef.scan()
      
      ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
        console.log(`Card detected: ${serialNumber}`)
        
        for (const record of message.records) {
          if (record.recordType === 'text') {
            const decoder = new TextDecoder()
            const text = decoder.decode(record.data)
            handleNFCData(text)
          } else if (record.recordType === 'url') {
            const decoder = new TextDecoder()
            const url = decoder.decode(record.data)
            handleNFCData(url)
          }
        }
      })

      ndef.addEventListener('readingerror', () => {
        console.error('NFC reading error')
        setError('Failed to read NFC card')
      })

    } catch (err: any) {
      console.error('NFC Error:', err)
      setError(err.message || 'Failed to start NFC reader')
      setIsReading(false)
    }
  }

  const stopNFCReader = () => {
    setIsReading(false)
  }

  const handleNFCData = (data: string) => {
    // Vibrate on successful read
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }

    setLastRead(data)
    onRead(data)
    
    toast.success('NFC card read successfully!')
    
    // Prevent duplicate reads
    setTimeout(() => {
      setLastRead(null)
    }, 5000)
  }

  if (!isNFCSupported) {
    return (
      <Alert 
        severity="info" 
        icon={<QrCode />}
        sx={{ borderRadius: 2 }}
      >
        <Typography variant="body2">
          NFC is not supported on this device. Please use the QR code instead.
        </Typography>
      </Alert>
    )
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        borderRadius: 2,
        border: isReading ? '2px solid' : 'none',
        borderColor: 'primary.main',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {isReading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, transparent, #FF9500, transparent)',
            animation: 'scan 2s linear infinite',
            '@keyframes scan': {
              '0%': { transform: 'translateX(-100%)' },
              '100%': { transform: 'translateX(100%)' },
            },
          }}
        />
      )}

      <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
        <Box 
          sx={{ 
            width: 100, 
            height: 100, 
            borderRadius: '50%',
            bgcolor: isReading ? 'primary.light' : 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            position: 'relative',
          }}
        >
          <Nfc sx={{ fontSize: 50, color: isReading ? 'primary.main' : 'text.secondary' }} />
          
          {isReading && (
            <CircularProgress
              size={110}
              thickness={2}
              sx={{
                position: 'absolute',
                color: 'primary.main',
              }}
            />
          )}
        </Box>

        <Typography variant="h6" gutterBottom>
          {isReading ? 'Ready to Scan' : 'NFC Reader Inactive'}
        </Typography>

        <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
          {isReading 
            ? 'Tap an NFC card or device to pay'
            : 'Activate NFC reader to accept tap payments'
          }
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}

        {lastRead && (
          <Chip 
            label="Card Read Successfully"
            color="success"
            icon={<CheckCircle />}
            sx={{ mt: 2 }}
          />
        )}

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Chip 
            label={isReading ? 'Active' : 'Inactive'}
            color={isReading ? 'success' : 'default'}
            size="small"
          />
          <Chip 
            label="Android Chrome Only"
            color="warning"
            size="small"
            variant="outlined"
          />
        </Box>
      </Box>
    </Paper>
  )
}