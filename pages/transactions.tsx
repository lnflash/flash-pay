import React from 'react'
import { 
  Container, 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Paper,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useRouter } from 'next/router'
import { TransactionList } from '../src/components/transactions/TransactionList'
import { TransactionStats } from '../src/components/transactions/TransactionStats'
import { ProtectedRoute } from '../src/components/auth/ProtectedRoute'

export default function Transactions() {
  const router = useRouter()

  return (
    <ProtectedRoute requirePin>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="fixed" elevation={0}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => router.back()}
            >
              <ArrowBack />
            </IconButton>
            
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Transaction History
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg">
          <Box sx={{ pt: 10, pb: 3 }}>
            <TransactionStats />
            <TransactionList />
          </Box>
        </Container>
      </Box>
    </ProtectedRoute>
  )
}