import React, { useState, useEffect, useCallback } from "react"
import { getParams } from "js-lnurl"
import axios from "axios"
import {
  parsePaymentDestination,
  Network as NetworkGaloyClient,
} from "@galoymoney/client"

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

function NFCComponent({ paymentRequest }: Props) {
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
    if (lnurl && paymentRequest === "payout" && !hasRedeemed) {
      console.log("LNURL state updated:", lnurl)
      console.log("Begin redeeming rewards")
      redeemRewards(0.01) // TODO: convert to variable amount
      setHasRedeemed(true)
    }
  }, [lnurl, paymentRequest, hasRedeemed])

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

        if (paymentRequest === "payout") {
          extractLnurl(text)
          return
        }

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

  useEffect(() => {
    if (!!nfcMessage && !!paymentRequest) nfcHandler()
  }, [nfcMessage, paymentRequest])

  useEffect(() => {
    if (paymentRequest !== "payout") {
      setHasRedeemed(false)
      setLnurl(null)
    }
  }, [paymentRequest])

  const nfcHandler = async () => {
    if (!nfcMessage.toLowerCase().includes("lnurl")) {
      alert("Not a compatible flashcard")
      return
    }

    if (!paymentRequest) {
      alert("Add an amount and create an invoice before scanning the card")
      return
    }

    const sound = new Audio("/payment-sound.mp3")
    sound
      .play()
      .then(() => {
        console.log("Playback started successfully")
      })
      .catch((error) => {
        console.error("Playback failed", error)
      })

    setIsLoading(true)
    try {
      const [lnurlParams, parsedDestination] = await Promise.all([
        getParams(nfcMessage),
        parsePaymentDestination({
          destination: nfcMessage,
          network: "mainnet" as NetworkGaloyClient,
          lnAddressDomains: ["lnflash.me", "pay.lnflash.me", "flashapp.me"],
        }),
      ])

      console.log("LNURL PARAMS:", lnurlParams)
      console.log("PARSED DESTINATION:", parsedDestination)

      if (!("tag" in lnurlParams && lnurlParams.tag === "withdrawRequest")) {
        alert(`Not a properly configured lnurl withdraw tag`)
        setIsLoading(false)
        return
      }

      const { callback, k1 } = lnurlParams

      if (!k1 || !paymentRequest) {
        console.error("Missing k1 or paymentRequest for processing")
        setIsLoading(false)
        return
      }

      const url = new URL(callback)
      url.searchParams.set("k1", k1)
      url.searchParams.set("pr", paymentRequest)

      console.log("Constructed URL for redeem:", url.toString())

      const result = await fetch(url.toString())
      const lnurlResponse = await result.json()

      console.log("LNURL Response:", lnurlResponse)

      if (result.ok && lnurlResponse?.status?.toLowerCase() === "ok") {
        console.log("Payment successful")
      } else {
        const errorMessage =
          lnurlResponse?.reason || "Something went wrong. Please, try again later"
        alert(errorMessage)
      }
    } catch (error) {
      console.error("Error processing NFC payment", error)
    }
    setIsLoading(false)
  }

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

  return (
    <>
      {paymentRequest === undefined && (
        <div className="d-flex w-full">
          <button
            data-testid="nfc-btn"
            className={styles.secondaryBtn}
            style={{
              borderRadius: "0.5em",
              padding: "0.4rem",
              fontWeight: "normal",
            }}
            onClick={activateNfcScan}
            disabled={hasNFCPermission || !isNfcSupported}
          >
            {!isNfcSupported
              ? "Flashcard not supported"
              : hasNFCPermission
              ? "Flashcard activated"
              : "Activate Flashcard Tap to Pay"}
          </button>
        </div>
      )}
    </>
  )
}

export default React.memo(NFCComponent)
