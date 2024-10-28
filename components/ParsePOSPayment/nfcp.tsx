import React, { useState, useEffect } from "react"
import { getParams } from "js-lnurl"
import {
  parsePaymentDestination,
  Network as NetworkGaloyClient,
} from "@galoymoney/client"

import LoadingComponent from "../loading"

import styles from "./parse-payment.module.css"

type Props = {
  payoutRequest?: string | undefined
}

// TODO: refine the interface
interface NFCRecord {
  data?: ArrayBuffer | DataView
  encoding?: string
}

function NFCPComponent({ payoutRequest }: Props) {
  const [hasNFCPermission, setHasNFCPermission] = useState(false)
  const [nfcMessage, setNfcMessage] = useState("")
  const [isNfcSupported, setIsNfcSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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

        console.log("NFC record>>>>>>>>>", record)
        console.log("NFC TEXT>>>>>>>>>", text)

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
    if (!!nfcMessage && !!payoutRequest)
      // nfcHandler()
      console.log("NFC MESSAGE>>>>>>>>>", nfcMessage)
    console.log("PAYOUT REQUEST>>>>>>>>>", payoutRequest)
  }, [nfcMessage, payoutRequest])

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
      {payoutRequest !== undefined && (
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

export default NFCPComponent
