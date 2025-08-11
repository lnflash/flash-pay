import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Box } from '@mui/material'
import { POSPage } from '../src/components/pos/POSPage'
import { InvoiceDisplay } from '../src/components/invoice/InvoiceDisplay'
import { PaymentSuccess } from '../src/components/invoice/PaymentSuccess'
import { PinSetup } from '../src/components/auth/PinSetup'
import { useAppSelector, useAppDispatch } from '../src/store/hooks'
import { clearAmount } from '../src/store/slices/posSlice'
import { clearCurrentInvoice } from '../src/store/slices/invoiceSlice'
import { setUsername } from '../src/store/slices/authSlice'
import { useAccountDefaultWalletsQuery } from '../lib/graphql/generated'
import { useInvoice } from '../src/hooks/useInvoice'
import { useSubscription } from '@apollo/client'
import LoadingComponent from '../components/loading'

type PageState = 'pos' | 'invoice' | 'success' | 'pin-setup'

export default function POS() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [pageState, setPageState] = useState<PageState>('pos')
  
  const { username } = router.query
  const accountUsername = username?.toString() || ''
  
  const { isPinSet } = useAppSelector(state => state.auth)
  const { currentAmount } = useAppSelector(state => state.pos)
  const { currentInvoice } = useAppSelector(state => state.invoice)
  
  const { data, loading, error } = useAccountDefaultWalletsQuery({
    variables: { username: accountUsername },
    skip: !accountUsername,
  })
  
  const walletId = data?.accountDefaultWallet?.id
  const { generateInvoice, subscribeToInvoiceStatus } = useInvoice(walletId)

  // Subscribe to invoice status
  const { data: statusData } = useSubscription(
    currentInvoice ? subscribeToInvoiceStatus(
      currentInvoice.paymentRequest,
      currentInvoice.paymentHash
    ).subscription : null as any,
    currentInvoice ? {
      variables: subscribeToInvoiceStatus(
        currentInvoice.paymentRequest,
        currentInvoice.paymentHash
      ).variables,
    } : { skip: true }
  )

  useEffect(() => {
    if (accountUsername) {
      dispatch(setUsername(accountUsername))
    }
  }, [accountUsername, dispatch])

  useEffect(() => {
    if (!isPinSet && pageState !== 'pin-setup') {
      setPageState('pin-setup')
    }
  }, [isPinSet, pageState])

  useEffect(() => {
    if (statusData?.lnInvoicePaymentStatus?.status === 'PAID') {
      setPageState('success')
    }
  }, [statusData])

  const handleCharge = async () => {
    const amount = parseFloat(currentAmount)
    if (amount > 0) {
      const invoice = await generateInvoice(amount, 'Flash POS Payment')
      if (invoice) {
        setPageState('invoice')
      }
    }
  }

  const handleBack = () => {
    dispatch(clearCurrentInvoice())
    setPageState('pos')
  }

  const handlePaymentComplete = () => {
    setPageState('success')
  }

  const handleSuccessComplete = () => {
    dispatch(clearAmount())
    dispatch(clearCurrentInvoice())
    setPageState('pos')
  }

  const handlePinSetupComplete = () => {
    setPageState('pos')
  }

  if (loading) return <LoadingComponent />
  
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        Error: {error.message}
      </Box>
    )
  }

  if (!isPinSet && pageState === 'pin-setup') {
    return <PinSetup onComplete={handlePinSetupComplete} />
  }

  switch (pageState) {
    case 'invoice':
      return currentInvoice ? (
        <InvoiceDisplay
          invoice={currentInvoice}
          onBack={handleBack}
          onPaymentComplete={handlePaymentComplete}
        />
      ) : null

    case 'success':
      return (
        <PaymentSuccess
          amount={parseFloat(currentAmount)}
          onComplete={handleSuccessComplete}
        />
      )

    case 'pos':
    default:
      return <POSPage onCharge={handleCharge} />
  }
}