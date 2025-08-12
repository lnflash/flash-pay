import React from 'react'
import { 
  Container, 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Divider,
  Button,
} from '@mui/material'
import { 
  ArrowBack,
  DarkMode,
  Vibration,
  VolumeUp,
  Lock,
  Language,
  Timer,
  Code,
} from '@mui/icons-material'
import { useRouter } from 'next/router'
import { ProtectedRoute } from '../src/components/auth/ProtectedRoute'
import { useAppSelector, useAppDispatch } from '../src/store/hooks'
import { 
  setTheme,
  toggleSound,
  toggleVibration,
  toggleDeveloperMode,
  resetSettings,
} from '../src/store/slices/settingsSlice'
import { removePin } from '../src/store/slices/authSlice'

export default function Settings() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const settings = useAppSelector(state => state.settings)
  const { isPinSet } = useAppSelector(state => state.auth)

  const handleThemeToggle = () => {
    dispatch(setTheme(settings.theme === 'light' ? 'dark' : 'light'))
  }

  const handleRemovePin = () => {
    if (confirm('Are you sure you want to remove your PIN?')) {
      dispatch(removePin())
    }
  }

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      dispatch(resetSettings())
    }
  }

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
              Settings
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md">
          <Box sx={{ pt: 10, pb: 3 }}>
            {/* Appearance Settings */}
            <Paper elevation={2} sx={{ mb: 2, borderRadius: 2 }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <DarkMode />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Dark Mode"
                    secondary="Use dark theme"
                  />
                  <Switch
                    checked={settings.theme === 'dark'}
                    onChange={handleThemeToggle}
                  />
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemIcon>
                    <VolumeUp />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sound Effects"
                    secondary="Play sounds for actions"
                  />
                  <Switch
                    checked={settings.soundEnabled}
                    onChange={() => dispatch(toggleSound())}
                  />
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemIcon>
                    <Vibration />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Vibration"
                    secondary="Haptic feedback for actions"
                  />
                  <Switch
                    checked={settings.vibrationEnabled}
                    onChange={() => dispatch(toggleVibration())}
                  />
                </ListItem>
              </List>
            </Paper>

            {/* Security Settings */}
            <Paper elevation={2} sx={{ mb: 2, borderRadius: 2 }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Timer />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Auto Logout"
                    secondary={`After ${settings.autoLogoutTime} minutes of inactivity`}
                  />
                </ListItem>
                
                {isPinSet && (
                  <>
                    <Divider />
                    <ListItem>
                      <ListItemIcon>
                        <Lock />
                      </ListItemIcon>
                      <ListItemText 
                        primary="PIN Lock"
                        secondary="Remove PIN protection"
                      />
                      <Button 
                        variant="outlined" 
                        color="error"
                        size="small"
                        onClick={handleRemovePin}
                      >
                        Remove
                      </Button>
                    </ListItem>
                  </>
                )}
              </List>
            </Paper>

            {/* Advanced Settings */}
            <Paper elevation={2} sx={{ mb: 2, borderRadius: 2 }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Language />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Language"
                    secondary={settings.language.toUpperCase()}
                  />
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemIcon>
                    <Code />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Developer Mode"
                    secondary="Show advanced options"
                  />
                  <Switch
                    checked={settings.developerMode}
                    onChange={() => dispatch(toggleDeveloperMode())}
                  />
                </ListItem>
              </List>
            </Paper>

            {/* Reset Button */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleResetSettings}
              >
                Reset All Settings
              </Button>
            </Box>

            {/* Version Info */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Flash POS v2.0.0
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                Built with Lightning Network ⚡
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </ProtectedRoute>
  )
}