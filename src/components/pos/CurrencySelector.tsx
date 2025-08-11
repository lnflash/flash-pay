import React from 'react'
import { 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  SelectChangeEvent,
  Box,
  Typography
} from '@mui/material'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setDisplayCurrency as setPosDisplayCurrency } from '../../store/slices/posSlice'
import { setDisplayCurrency as setSettingsDisplayCurrency } from '../../store/slices/settingsSlice'

const currencies = [
  { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', flag: '🇯🇲' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'TTD', name: 'Trinidad Dollar', symbol: 'TT$', flag: '🇹🇹' },
  { code: 'BBD', name: 'Barbados Dollar', symbol: 'Bds$', flag: '🇧🇧' },
  { code: 'XCD', name: 'East Caribbean Dollar', symbol: 'EC$', flag: '🇦🇬' },
]

interface CurrencySelectorProps {
  variant?: 'outlined' | 'filled' | 'standard'
  size?: 'small' | 'medium'
  fullWidth?: boolean
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  variant = 'outlined',
  size = 'medium',
  fullWidth = false,
}) => {
  const dispatch = useAppDispatch()
  const displayCurrency = useAppSelector(state => state.settings.displayCurrency)

  const handleChange = (event: SelectChangeEvent) => {
    const newCurrency = event.target.value
    dispatch(setPosDisplayCurrency(newCurrency))
    dispatch(setSettingsDisplayCurrency(newCurrency))
    localStorage.setItem('display', newCurrency)
  }

  return (
    <FormControl variant={variant} size={size} fullWidth={fullWidth}>
      <InputLabel id="currency-select-label">Currency</InputLabel>
      <Select
        labelId="currency-select-label"
        id="currency-select"
        value={displayCurrency}
        label="Currency"
        onChange={handleChange}
      >
        {currencies.map((currency) => (
          <MenuItem key={currency.code} value={currency.code}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" component="span">
                {currency.flag}
              </Typography>
              <Typography>
                {currency.code} - {currency.name}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}