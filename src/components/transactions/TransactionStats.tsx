import React, { useMemo } from 'react'
import { Grid, Paper, Typography, Box } from '@mui/material'
import { 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  CheckCircle 
} from '@mui/icons-material'
import { useAppSelector } from '../../store/hooks'
import { formatCurrency } from '../../utils/currency'

export const TransactionStats: React.FC = () => {
  const { transactions } = useAppSelector(state => state.transaction)
  const { displayCurrency } = useAppSelector(state => state.settings)

  const stats = useMemo(() => {
    const completed = transactions.filter(tx => tx.status === 'completed')
    const received = completed.filter(tx => tx.type === 'invoice')
    const sent = completed.filter(tx => tx.type === 'payment')
    
    const totalReceived = received.reduce((sum, tx) => sum + tx.displayAmount, 0)
    const totalSent = sent.reduce((sum, tx) => sum + tx.displayAmount, 0)
    const totalTransactions = completed.length
    const successRate = transactions.length > 0 
      ? (completed.length / transactions.length * 100).toFixed(1)
      : '0'

    return {
      totalReceived,
      totalSent,
      totalTransactions,
      successRate,
    }
  }, [transactions])

  const statCards = [
    {
      title: 'Total Received',
      value: formatCurrency(stats.totalReceived, displayCurrency),
      icon: <TrendingDown />,
      color: 'success.main',
      bgColor: 'success.light',
    },
    {
      title: 'Total Sent',
      value: formatCurrency(stats.totalSent, displayCurrency),
      icon: <TrendingUp />,
      color: 'error.main',
      bgColor: 'error.light',
    },
    {
      title: 'Total Transactions',
      value: stats.totalTransactions.toString(),
      icon: <Receipt />,
      color: 'info.main',
      bgColor: 'info.light',
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: <CheckCircle />,
      color: 'warning.main',
      bgColor: 'warning.light',
    },
  ]

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {statCards.map((card) => (
        <Grid item xs={6} md={3} key={card.title}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: card.bgColor,
                opacity: 0.2,
              }}
            />
            
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Box sx={{ color: card.color }}>
                {card.icon}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {card.title}
              </Typography>
            </Box>
            
            <Typography variant="h5" fontWeight="bold">
              {card.value}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}