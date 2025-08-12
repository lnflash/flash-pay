import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Alert,
} from '@mui/material'
import {
  CameraAlt,
  Close,
  FlipCameraIos,
  CheckCircle,
} from '@mui/icons-material'
import jsQR from 'jsqr'
import toast from 'react-hot-toast'

interface QRScannerProps {
  onScan: (data: string) => void
  isActive: boolean
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (isActive) {
      startScanning()
    } else {
      stopScanning()
    }

    return () => {
      stopScanning()
    }
  }, [isActive])

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      })
      
      streamRef.current = stream
      setHasPermission(true)
      setIsScanning(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        scanQRCode()
      }
    } catch (err) {
      console.error('Camera access denied:', err)
      setHasPermission(false)
      toast.error('Camera access denied')
    }
  }

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    
    setIsScanning(false)
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code && code.data && code.data !== lastScanned) {
        handleQRCodeDetected(code.data)
      }
    }

    animationRef.current = requestAnimationFrame(scanQRCode)
  }

  const handleQRCodeDetected = (data: string) => {
    // Vibrate on successful scan
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }

    setLastScanned(data)
    onScan(data)
    toast.success('QR code scanned successfully!')
    
    // Prevent duplicate scans
    setTimeout(() => {
      setLastScanned(null)
    }, 3000)
  }

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    if (isScanning) {
      stopScanning()
      setTimeout(() => startScanning(), 100)
    }
  }

  if (hasPermission === false) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        <Typography variant="body2">
          Camera permission denied. Please enable camera access to scan QR codes.
        </Typography>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={startScanning}
          sx={{ mt: 1 }}
        >
          Try Again
        </Button>
      </Alert>
    )
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {!isScanning ? (
        <Box textAlign="center" py={4}>
          <CameraAlt sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            QR Code Scanner
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Scan a Lightning QR code to process payment
          </Typography>
          <Button
            variant="contained"
            startIcon={<CameraAlt />}
            onClick={startScanning}
            sx={{ mt: 2 }}
          >
            Start Scanning
          </Button>
        </Box>
      ) : (
        <Box position="relative">
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 400,
              mx: 'auto',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
              playsInline
            />
            
            {/* Scanning overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                height: '80%',
                border: '3px solid',
                borderColor: 'primary.main',
                borderRadius: 2,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: 'linear-gradient(90deg, transparent, #FF9500, transparent)',
                  animation: 'scan 2s linear infinite',
                },
                '@keyframes scan': {
                  '0%': { transform: 'translateY(0)' },
                  '100%': { transform: 'translateY(calc(80vw - 3px))' },
                },
              }}
            />
          </Box>

          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          />

          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2,
            }}
          >
            <IconButton onClick={toggleCamera}>
              <FlipCameraIos />
            </IconButton>
            
            <Typography variant="body2" color="text.secondary">
              Scanning...
            </Typography>
            
            <IconButton onClick={stopScanning} color="error">
              <Close />
            </IconButton>
          </Box>

          {lastScanned && (
            <Alert 
              severity="success" 
              icon={<CheckCircle />}
              sx={{ mt: 2 }}
            >
              QR code detected!
            </Alert>
          )}
        </Box>
      )}
    </Paper>
  )
}