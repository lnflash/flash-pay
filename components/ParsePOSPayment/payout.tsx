import React, { useState, useEffect, useCallback } from "react"
import { getParams } from "js-lnurl"
import axios from "axios"

import LoadingComponent from "../loading"
import styles from "./parse-payment.module.css"

type Props = {
  paymentRequest?: string | undefined
}

// TODO: refine the interface
interface NFCRecord {
  data?: ArrayBuffer | DataView
  encoding?: string
}

function NFCPayoutComponent({ paymentRequest }: Props) {
  const [hasNFCPermission, setHasNFCPermission] = useState(false)
  const [nfcMessage, setNfcMessage] = useState("")
  const [isNfcSupported, setIsNfcSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lnurl, setLnurl] = useState<string | null>(null)
  const [hasRedeemed, setHasRedeemed] = useState(false)

  const decodeNDEFRecord = (record: NFCRecord) => {
    if (!record.data) {
      console.log("No data found")
      return ""
    }

    let buffer: ArrayBuffer
    if (record.data instanceof ArrayBuffer) {
      buffer = record.data
    } else if (record.data instanceof DataView) {
      buffer = record.data.buffer
    } else {
      console.log("Data type not supported")
      return ""
    }

    const decoder = new TextDecoder(record.encoding || "utf-8")
    return decoder.decode(buffer)
  }

  const handleSubmit = useCallback(async (payload: string) => {
    try {
      const payloadPart = payload.split("?")[1]
      const domain = payload.split("/")[2]
      const url = `https://${domain}/boltcards/balance?${payloadPart}`
      const response = await axios.get(url)
      const html = response.data
      const lnurlMatch = html.match(/href="lightning:(lnurl\w+)"/)
      if (lnurlMatch) {
        setLnurlSafely(lnurlMatch[1])
      }
    } catch (error) {
      console.error("HTTP Error", error)
    }
  }, [])

  const setLnurlSafely = (value: string) => {
    setLnurl((prev) => (prev !== value ? value : prev))
  }

  const redeemRewards = async (amount: number) => {
    if (!lnurl) {
      console.error("LNURL not set")
      return
    }
    const pullPaymentId = process.env.NEXT_PUBLIC_PULL_PAYMENT_ID
    const domain = process.env.NEXT_PUBLIC_BTCPAY_SERVER_URL

    const requestBody = {
      destination: lnurl,
      amount: amount.toFixed(2),
      paymentMethod: "BTC-LightningLike",
    }

    const url = `https://${domain}/api/v1/pull-payments/${pullPaymentId}/payouts`
    try {
      const response = await axios.post(url, requestBody)
      console.log("Response from redeeming rewards", response)
    } catch (error) {
      console.error("Error redeeming rewards", error)
    }
  }

  useEffect(() => {
    if (lnurl && !hasRedeemed) {
      console.log("LNURL state updated:", lnurl)
      console.log("Begin redeeming rewards")
      redeemRewards(0.01) // TODO: convert to variable amount
      setHasRedeemed(true)
      // return to the previous page
      window.history.back()
    }
  }, [lnurl, hasRedeemed])

  const extractLnurl = async (text: string) => {
    if (text.startsWith("lnurlw")) {
      await handleSubmit(text)
    }
  }

  const activateNfcScan = async () => {
    await handleNFCScan()
    alert(
      "Flashcard is now active. There will be no need to activate it again. Please tap your card to redeem the payment",
    )
  }

  const handleNFCScan = async () => {
    if (!("NDEFReader" in window)) {
      console.error("NFC is not supported")
      return
    }

    console.log("NFC is supported, start reading")

    const ndef = new NDEFReader()

    try {
      await ndef.scan()

      console.log("NFC scan started successfully.")

      ndef.onreading = (event) => {
        console.log("NFC tag read.")
        const record = event.message.records[0]
        const text = decodeNDEFRecord(record)

        extractLnurl(text)

        setNfcMessage(text)
      }

      ndef.onreadingerror = () => {
        console.error("Cannot read data from the NFC tag. Try another one?")
      }
    } catch (error) {
      console.error(`Error! Scan failed to start: ${error}.`)
    }
  }

  useEffect(() => {
    setIsNfcSupported("NDEFReader" in window)
    ;(async () => {
      if (!("permissions" in navigator)) {
        console.error("Permissions API not supported")
        return
      }

      let result: PermissionStatus
      try {
        /* eslint @typescript-eslint/ban-ts-comment: "off" */
        // @ts-ignore-next-line
        result = await navigator.permissions.query({ name: "nfc" })
      } catch (err) {
        console.error("Error querying NFC permission", err)
        return
      }

      console.log("result permission query", result)

      if (result.state === "granted") {
        setHasNFCPermission(true)
      } else {
        setHasNFCPermission(false)
      }

      result.onchange = () => {
        setHasNFCPermission(result.state === "granted")
      }
    })()
  }, [setHasNFCPermission])

  useEffect(() => {
    if (hasNFCPermission) {
      handleNFCScan()
    }
  }, [hasNFCPermission])

  if (isLoading) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100dvh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 100,
          backgroundColor: "rgb(255, 255, 255)",
        }}
      >
        <LoadingComponent />
      </div>
    )
  }

  return <>{paymentRequest === undefined && <div className="d-flex w-full"></div>}</>
}

export default React.memo(NFCPayoutComponent)
