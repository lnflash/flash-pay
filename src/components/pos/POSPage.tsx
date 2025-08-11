import React, { useState } from 'react'
import { 
  Container, 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Settings,
  History,
  Lock,
  Home,
} from '@mui/icons-material'
import { NumPad } from './NumPad'
import { AmountDisplay } from './AmountDisplay'
import { CurrencySelector } from './CurrencySelector'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { clearAmount } from '../../store/slices/posSlice'
import { logout } from '../../store/slices/authSlice'
import { useRouter } from 'next/router'

interface POSPageProps {
  onCharge: () => void
}

export const POSPage: React.FC<POSPageProps> = ({ onCharge }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { username } = useAppSelector(state => state.auth)
  const { currentAmount } = useAppSelector(state => state.pos)

  const handleCharge = () => {
    if (currentAmount && parseFloat(currentAmount) > 0) {
      onCharge()
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearAmount())
    router.push('/')
  }

  const menuItems = [
    { 
      text: 'Home', 
      icon: <Home />, 
      onClick: () => router.push('/') 
    },
    { 
      text: 'Transaction History', 
      icon: <History />, 
      onClick: () => router.push('/transactions') 
    },
    { 
      text: 'Settings', 
      icon: <Settings />, 
      onClick: () => router.push('/settings') 
    },
    { 
      text: 'Lock Screen', 
      icon: <Lock />, 
      onClick: handleLogout 
    },
  ]

  return (
    <>
      <AppBar position="fixed" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Flash POS
          </Typography>
          
          {username && (
            <Typography variant="body2">
              @{username}
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }} role="presentation">
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Flash POS</Typography>
            {username && (
              <Typography variant="body2" color="text.secondary">
                @{username}
              </Typography>
            )}
          </Box>
          
          <Divider />
          
          <List>
            {menuItems.map((item) => (
              <ListItem 
                button 
                key={item.text}
                onClick={() => {
                  item.onClick()
                  setDrawerOpen(false)
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Container maxWidth="sm">
        <Box sx={{ 
          pt: 10, 
          pb: 3,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Box sx={{ mb: 2 }}>
            <CurrencySelector fullWidth />
          </Box>
          
          <AmountDisplay />
          
          <Box sx={{ flexGrow: 1 }}>
            <NumPad onSubmit={handleCharge} />
          </Box>
        </Box>
      </Container>
    </>
  )
}