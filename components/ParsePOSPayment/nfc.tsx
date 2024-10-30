import React, { useCallback, useState, useEffect } from "react"
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
      const domain = payload.split("/")[2] // Extract the domain from the payload

      const url = `https://${domain}/boltcards/balance?${payloadPart}`
      const response = await axios.get(url)
      const html = response.data
      const lnurlMatch = html.match(/href="lightning:(lnurl\w+)"/)
      setLnurl(lnurlMatch[1])
    } catch (error) {
      console.error("HTTP Error", error)
    }
  }, [])

  const redeemRewards = async (amount: number) => {
    if (!lnurl) {
      console.error("LNURL not set")
      return
    }
    const pullPaymentId = process.env.NEXT_PUBLIC_PULL_PAYMENT_ID
    const domain = process.env.NEXT_PUBLIC_BTCPAY_SERVER_URL

    // Define the request body
    const requestBody = {
      destination: lnurl, // Use the lnurl stored in the state
      amount: amount.toFixed(2), // Format the amount to USD
      paymentMethod: "BTC-LightningLike",
    }

    const url = `https://${domain}/api/v1/pull-payments/${pullPaymentId}/payouts`
    const response = await axios.post(url, requestBody)
    console.log("Response from redeeming rewards", response)
  }

  useEffect(() => {
    if (lnurl) {
      console.log("LNURL state updated:", lnurl)
      console.log("Begin redeeming rewards")
      redeemRewards(0.01) // TODO: convert to variable amount
    }
  }, [lnurl])

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
        console.log(event.message)

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
        if (result.state === "granted") {
          setHasNFCPermission(true)
        } else {
          setHasNFCPermission(false)
        }
      }
    })()
  }, [setHasNFCPermission])

  React.useEffect(() => {
    console.log("hasNFCPermission", hasNFCPermission)

    if (hasNFCPermission) {
      handleNFCScan()
    }

    // handleNFCScan leads to an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNFCPermission])

  React.useEffect(() => {
    if (!!nfcMessage && !!paymentRequest) nfcHandler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nfcMessage, paymentRequest])

  const nfcHandler = async () => {
    if (!nfcMessage.toLowerCase().includes("lnurl")) {
      alert("Not a compatible flashcard")
      return
    }

    if (!paymentRequest) {
      alert("add an amount and create an invoice before scanning the card")
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
    const lnurlParams = await getParams(nfcMessage)
    console.log("NFC MESSAGE>>>>>>>>>", nfcMessage)

    // >>>>>>>>>>
    const parsedDestination = parsePaymentDestination({
      destination: nfcMessage,
      network: "mainnet" as NetworkGaloyClient, // hard coded to mainnet
      lnAddressDomains: ["lnflash.me", "pay.lnflash.me", "flashapp.me"],
    })

    console.log("GALOY PARSE PAYMENT DESTINATION>>>>", parsedDestination)
    // <<<<<<<<<<<

    console.log("LNURL PARAMS >>>>>>>>>>>>>>>>??????????", lnurlParams)
    if (!("tag" in lnurlParams && lnurlParams.tag === "withdrawRequest")) {
      alert(
        `not a properly configured lnurl withdraw tag\n\n${nfcMessage}\n\n${
          "reason" in lnurlParams && lnurlParams.reason
        }`,
      )
      setIsLoading(false)
      return
    }

    const { callback, k1 } = lnurlParams

    const urlObject = new URL(callback)
    const searchParams = urlObject.searchParams
    searchParams.set("k1", k1)
    searchParams.set("pr", paymentRequest)

    const url = urlObject.toString()

    const result = await fetch(url)
    const lnurlResponse = await result.json()

    if (result.ok) {
      if (lnurlResponse?.status?.toLowerCase() !== "ok") {
        console.error(lnurlResponse, "error with redeeming")
        alert(lnurlResponse.reason || "Something went wrong. Please, try again later")
      }
    } else if (
      (lnurlResponse.reason && lnurlResponse.reason.includes("not within bounds")) ||
      lnurlResponse.reason.includes("Amount is bigger than the maximum")
    ) {
      alert("Payment Failed: Insufficient Funds")
    } else {
      let errorMessage = ""
      try {
        const decoded = await result.json()
        if (decoded.reason) {
          errorMessage += decoded.reason
        }
        if (decoded.message) {
          errorMessage += decoded.message
        }
      } finally {
        let message = `Error processing payment.\n\nHTTP error code: ${result.status}`
        if (errorMessage) {
          message += `\n\nError message: ${errorMessage}`
        }
        alert(message)
      }
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
        <div className="d-flex  w-full">
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

export default NFCComponent
