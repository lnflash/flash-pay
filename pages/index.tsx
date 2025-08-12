import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
} from '@mui/material'
import { ArrowForward, PointOfSale } from '@mui/icons-material'
import { CurrencySelector } from '../src/components/pos/CurrencySelector'
import { useAppDispatch } from '../src/store/hooks'
import { setUsername } from '../src/store/slices/authSlice'
import { setDisplayCurrency } from '../src/store/slices/settingsSlice'

function Home() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [usernameInput, setUsernameInput] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if we have a stored username
    const storedUsername = localStorage.getItem('username')
    if (storedUsername) {
      setUsernameInput(storedUsername)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (usernameInput.trim()) {
      localStorage.setItem('username', usernameInput)
      dispatch(setUsername(usernameInput))
      router.push(`/pos?username=${usernameInput}`)
    }
  }

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.98)',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 3,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF9500 0%, #FF6200 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(255, 149, 0, 0.4)',
            }}
          >
            <PointOfSale sx={{ fontSize: 40, color: 'white' }} />
          </Box>

          <Typography variant="h4" gutterBottom fontWeight="bold">
            Flash POS
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            Lightning-fast Bitcoin payments for merchants
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3} sx={{ mt: 4 }}>
              <TextField
                fullWidth
                label="Flash Username"
                placeholder="Enter your username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />

              <CurrencySelector fullWidth />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                endIcon={<ArrowForward />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #FF9500 0%, #FF6200 100%)',
                  boxShadow: '0 4px 20px rgba(255, 149, 0, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 30px rgba(255, 149, 0, 0.4)',
                  },
                }}
              >
                Open Cash Register
              </Button>
            </Stack>
          </form>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 3, display: 'block' }}
          >
            Powered by Lightning Network ⚡
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}

export default Home