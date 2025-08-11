export const formatCurrency = (amount: number, currency: string): string => {
  const currencyConfig: Record<string, { symbol: string; decimals: number; position: 'before' | 'after' }> = {
    USD: { symbol: '$', decimals: 2, position: 'before' },
    JMD: { symbol: 'J$', decimals: 2, position: 'before' },
    EUR: { symbol: '€', decimals: 2, position: 'before' },
    GBP: { symbol: '£', decimals: 2, position: 'before' },
    CAD: { symbol: 'C$', decimals: 2, position: 'before' },
    TTD: { symbol: 'TT$', decimals: 2, position: 'before' },
    BBD: { symbol: 'Bds$', decimals: 2, position: 'before' },
    XCD: { symbol: 'EC$', decimals: 2, position: 'before' },
  }

  const config = currencyConfig[currency] || { symbol: currency, decimals: 2, position: 'before' }
  const formatted = amount.toFixed(config.decimals)
  
  return config.position === 'before' 
    ? `${config.symbol}${formatted}`
    : `${formatted}${config.symbol}`
}

export const parseCurrencyAmount = (input: string): number => {
  const cleanedInput = input.replace(/[^0-9.-]/g, '')
  const amount = parseFloat(cleanedInput)
  return isNaN(amount) ? 0 : amount
}