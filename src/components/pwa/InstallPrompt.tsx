import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material'
import { GetApp, Close } from '@mui/icons-material'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show prompt after a delay
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleClose = () => {
    setShowPrompt(false)
    // Don't show again for 7 days
    localStorage.setItem('installPromptDismissed', Date.now().toString())
  }

  // Check if prompt was recently dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('installPromptDismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) {
        setShowPrompt(false)
      }
    }
  }, [])

  if (isIOS && showPrompt) {
    return (
      <Dialog open={showPrompt} onClose={handleClose}>
        <DialogTitle>Install Flash POS</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            To install Flash POS on your iOS device:
          </Typography>
          <Box component="ol" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" gutterBottom>
              Tap the Share button in Safari
            </Typography>
            <Typography component="li" variant="body2" gutterBottom>
              Scroll down and tap "Add to Home Screen"
            </Typography>
            <Typography component="li" variant="body2" gutterBottom>
              Tap "Add" to install
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Got it</Button>
        </DialogActions>
      </Dialog>
    )
  }

  return (
    <Dialog open={showPrompt && !!deferredPrompt} onClose={handleClose}>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          Install Flash POS
          <Close onClick={handleClose} sx={{ cursor: 'pointer' }} />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box textAlign="center" py={2}>
          <GetApp sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="body1" gutterBottom>
            Install Flash POS for quick access and offline capabilities
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Works offline
            • Faster loading
            • Push notifications
            • Home screen access
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Not Now
        </Button>
        <Button onClick={handleInstall} variant="contained" color="primary">
          Install
        </Button>
      </DialogActions>
    </Dialog>
  )
}