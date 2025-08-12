import React, { useEffect, useState } from 'react'
import { Box, Paper, Typography, Button } from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import dynamic from 'next/dynamic'
import successAnimation from '../../../components/success-animation.json'
import { useAppSelector } from '../../store/hooks'
import { formatCurrency } from '../../utils/currency'

const Lottie = dynamic(() => import('react-lottie'), { ssr: false })

interface PaymentSuccessProps {
  amount: number
  onComplete: () => void
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  amount,
  onComplete,
}) => {
  const { displayCurrency } = useAppSelector(state => state.settings)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
    
    const timer = setTimeout(() => {
      onComplete()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: successAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Paper
        elevation={5}
        sx={{
          p: 4,
          borderRadius: 3,
          textAlign: 'center',
          maxWidth: 400,
          width: '100%',
        }}
      >
        {mounted && (
          <Box sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }}>
            <Lottie options={defaultOptions} height={200} width={200} />
          </Box>
        )}

        <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />

        <Typography variant="h4" gutterBottom>
          Payment Successful!
        </Typography>

        <Typography variant="h5" color="primary" gutterBottom>
          {formatCurrency(amount, displayCurrency)}
        </Typography>

        <Typography variant="body1" color="text.secondary" gutterBottom>
          Thank you for your payment
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onComplete}
          sx={{ mt: 3 }}
        >
          New Transaction
        </Button>
      </Paper>
    </Box>
  )
}