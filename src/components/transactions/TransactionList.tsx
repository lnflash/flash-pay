import React, { useState } from 'react'
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Typography,
  Chip,
  Box,
  IconButton,
  Collapse,
  Divider,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import {
  ArrowUpward,
  ArrowDownward,
  ExpandMore,
  ExpandLess,
  Search,
  FilterList,
  ContentCopy,
} from '@mui/icons-material'
import { format } from 'date-fns'
import { useAppSelector } from '../../store/hooks'
import { Transaction } from '../../store/slices/transactionSlice'
import { formatCurrency } from '../../utils/currency'
import copy from 'copy-to-clipboard'
import toast from 'react-hot-toast'

export const TransactionList: React.FC = () => {
  const { transactions } = useAppSelector(state => state.transaction)
  const { displayCurrency } = useAppSelector(state => state.settings)
  
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  const handleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleCopyHash = (hash: string) => {
    if (copy(hash)) {
      toast.success('Payment hash copied!')
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = searchTerm === '' || 
      tx.memo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || tx.status === filterStatus
    const matchesType = filterType === 'all' || tx.type === filterType
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'success'
      case 'pending': return 'warning'
      case 'failed': return 'error'
      default: return 'default'
    }
  }

  const getIcon = (type: Transaction['type']) => {
    return type === 'invoice' ? <ArrowDownward /> : <ArrowUpward />
  }

  const getIconColor = (type: Transaction['type']) => {
    return type === 'invoice' ? 'success.main' : 'error.main'
  }

  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        Transaction History
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filterType}
            label="Type"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="invoice">Received</MenuItem>
            <MenuItem value="payment">Sent</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredTransactions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No transactions found
          </Typography>
        </Box>
      ) : (
        <List>
          {filteredTransactions.map((transaction, index) => (
            <React.Fragment key={transaction.id}>
              {index > 0 && <Divider />}
              
              <ListItem>
                <ListItemIcon>
                  <Box sx={{ color: getIconColor(transaction.type) }}>
                    {getIcon(transaction.type)}
                  </Box>
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body1">
                        {formatCurrency(transaction.displayAmount, transaction.displayCurrency)}
                      </Typography>
                      <Chip
                        label={transaction.status}
                        size="small"
                        color={getStatusColor(transaction.status)}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                      {transaction.memo && (
                        <Typography variant="body2" color="text.secondary">
                          {transaction.memo}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                
                <IconButton onClick={() => handleExpand(transaction.id)}>
                  {expandedId === transaction.id ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </ListItem>

              <Collapse in={expandedId === transaction.id}>
                <Box sx={{ px: 4, pb: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Transaction ID:</strong> {transaction.id}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Amount (sats):</strong> {transaction.amount.toLocaleString()}
                  </Typography>
                  
                  {transaction.paymentHash && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2">
                        <strong>Payment Hash:</strong> {transaction.paymentHash.substring(0, 20)}...
                      </Typography>
                      <IconButton 
                        size="small"
                        onClick={() => handleCopyHash(transaction.paymentHash!)}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                  
                  {transaction.completedAt && (
                    <Typography variant="body2">
                      <strong>Completed:</strong> {format(new Date(transaction.completedAt), 'MMM dd, yyyy HH:mm:ss')}
                    </Typography>
                  )}
                </Box>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  )
}