import { useState, useCallback } from 'react'
import { gql, useMutation, useSubscription } from '@apollo/client'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { 
  setCurrentInvoice, 
  updateInvoiceStatus,
  setGenerating,
  setError 
} from '../store/slices/invoiceSlice'
import { addTransaction, updateTransaction } from '../store/slices/transactionSlice'
import { useSatPrice } from './useSatPrice'

const CREATE_INVOICE_ON_BEHALF_OF = gql`
  mutation lnInvoiceCreateOnBehalfOfRecipient(
    $walletId: WalletId!
    $amount: SatAmount!
    $memo: Memo
  ) {
    mutationData: lnInvoiceCreateOnBehalfOfRecipient(
      input: { recipientWalletId: $walletId, amount: $amount, memo: $memo }
    ) {
      errors {
        message
      }
      invoice {
        paymentRequest
        paymentHash
        paymentSecret
        satoshis
      }
    }
  }
`

const CREATE_INVOICE_NOAMOUNT = gql`
  mutation lnNoAmountInvoiceCreateOnBehalfOfRecipient($walletId: WalletId!, $memo: Memo) {
    mutationData: lnNoAmountInvoiceCreateOnBehalfOfRecipient(
      input: { recipientWalletId: $walletId, memo: $memo }
    ) {
      errors {
        message
      }
      invoice {
        paymentRequest
        paymentHash
        paymentSecret
      }
    }
  }
`

const INVOICE_STATUS_SUBSCRIPTION = gql`
  subscription lnInvoicePaymentStatus($input: LnInvoicePaymentStatusInput!) {
    lnInvoicePaymentStatus(input: $input) {
      status
      errors {
        message
      }
    }
  }
`

export const useInvoice = (walletId?: string) => {
  const dispatch = useAppDispatch()
  const { displayCurrency } = useAppSelector(state => state.settings)
  const { convertToSats } = useSatPrice(displayCurrency)
  const [isGenerating, setIsGenerating] = useState(false)

  const [createInvoiceWithAmount] = useMutation(CREATE_INVOICE_ON_BEHALF_OF)
  const [createInvoiceNoAmount] = useMutation(CREATE_INVOICE_NOAMOUNT)

  const generateInvoice = useCallback(async (
    amount: number,
    memo?: string
  ) => {
    if (!walletId) {
      dispatch(setError('No wallet ID provided'))
      return null
    }

    setIsGenerating(true)
    dispatch(setGenerating(true))

    try {
      const satsAmount = convertToSats(amount)
      if (!satsAmount) {
        throw new Error('Could not convert amount to sats')
      }

      let result
      if (satsAmount > 0) {
        result = await createInvoiceWithAmount({
          variables: {
            walletId,
            amount: satsAmount,
            memo: memo || '',
          },
        })
      } else {
        result = await createInvoiceNoAmount({
          variables: {
            walletId,
            memo: memo || '',
          },
        })
      }

      if (result.data?.mutationData?.errors?.length > 0) {
        throw new Error(result.data.mutationData.errors[0].message)
      }

      const invoiceData = result.data?.mutationData?.invoice
      if (!invoiceData) {
        throw new Error('No invoice data received')
      }

      const invoice = {
        paymentRequest: invoiceData.paymentRequest,
        paymentHash: invoiceData.paymentHash,
        amount: amount,
        memo,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        createdAt: Date.now(),
        status: 'pending' as const,
      }

      dispatch(setCurrentInvoice(invoice))
      
      // Add to transaction history
      dispatch(addTransaction({
        id: invoiceData.paymentHash,
        amount: satsAmount,
        displayAmount: amount,
        displayCurrency,
        memo,
        status: 'pending',
        type: 'invoice',
        createdAt: new Date().toISOString(),
        paymentHash: invoiceData.paymentHash,
        paymentRequest: invoiceData.paymentRequest,
      }))

      return invoice
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to generate invoice'))
      return null
    } finally {
      setIsGenerating(false)
      dispatch(setGenerating(false))
    }
  }, [walletId, convertToSats, displayCurrency, createInvoiceWithAmount, createInvoiceNoAmount, dispatch])

  const subscribeToInvoiceStatus = useCallback((paymentRequest: string, paymentHash: string) => {
    return {
      subscription: INVOICE_STATUS_SUBSCRIPTION,
      variables: {
        input: {
          paymentRequest,
          paymentHash,
        },
      },
      onData: ({ data }: any) => {
        if (data?.data?.lnInvoicePaymentStatus?.status) {
          const status = data.data.lnInvoicePaymentStatus.status
          if (status === 'PAID') {
            dispatch(updateInvoiceStatus('paid'))
            dispatch(updateTransaction({
              id: paymentHash,
              status: 'completed',
              completedAt: new Date().toISOString(),
            }))
          }
        }
      },
    }
  }, [dispatch])

  return {
    generateInvoice,
    subscribeToInvoiceStatus,
    isGenerating,
  }
}