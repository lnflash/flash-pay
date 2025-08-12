import { useState, useEffect, useCallback } from 'react'
import useExistingSatPrice from '../../lib/use-sat-price'

export const useSatPrice = (displayCurrency: string) => {
  const { satsToUsd, usdToSats } = useExistingSatPrice()
  const [loading, setLoading] = useState(false)
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1,
    JMD: 155,
    EUR: 0.92,
    GBP: 0.79,
    CAD: 1.36,
    TTD: 6.78,
    BBD: 2.00,
    XCD: 2.70,
  })

  useEffect(() => {
    // In production, fetch real exchange rates
    // For now, using static rates
    setLoading(false)
  }, [displayCurrency])

  const convertToSats = useCallback((amount: number): number | null => {
    if (!usdToSats) return null
    
    // Convert to USD first if not already
    const usdAmount = displayCurrency === 'USD' 
      ? amount 
      : amount / exchangeRates[displayCurrency]
    
    // Convert USD to sats
    return Math.round(usdToSats(usdAmount))
  }, [displayCurrency, exchangeRates, usdToSats])

  const convertFromSats = useCallback((sats: number, targetCurrency?: string): number | null => {
    if (!satsToUsd) return null
    
    const currency = targetCurrency || displayCurrency
    
    // Convert sats to USD
    const usdAmount = satsToUsd(sats)
    
    // Convert USD to target currency
    return currency === 'USD' 
      ? usdAmount 
      : usdAmount * exchangeRates[currency]
  }, [displayCurrency, exchangeRates, satsToUsd])

  return {
    convertToSats,
    convertFromSats,
    loading,
    exchangeRates,
  }
}