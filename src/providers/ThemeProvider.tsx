import React from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useAppSelector } from '../store/hooks'
import { lightTheme, darkTheme } from '../theme/theme'

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const theme = useAppSelector((state) => state.settings.theme)
  const muiTheme = theme === 'dark' ? darkTheme : lightTheme

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}