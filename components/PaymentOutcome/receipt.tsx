import React from "react"
import Image from "react-bootstrap/Image"
import styles from "./payment-outcome.module.css"
import { formattedDate, formattedTime } from "../../utils/dateUtil"

interface Props {
  amount: string | string[] | undefined
  sats: string | string[] | undefined
  username: string | string[] | undefined
  paymentRequest: string
  memo: string | string[] | undefined
  paymentAmount: string | string[] | undefined
}

function Receipt(props: Props) {
  return (
    <div className={`w-100 ${styles.printReceipt}`}>
      <div className="d-flex py-3 justify-content-center">
        <Image src="/flash-qr-logo.png" className={styles.printImage} />
      </div>

      <div className="text-center">
        <span className={styles.fontLarge}>Sale Completed</span>
        {/* <h1 className={styles.fontXlarge}>{localStorage.getItem("display")}</h1> */}
        <h3 className={styles.fontLarge}>
          {"USD$"}
          {
            Array.isArray(props.paymentAmount)
              ? (parseFloat(props.paymentAmount[0]) / 100).toFixed(2) // Handle array by using the first element
              : props.paymentAmount
              ? (parseFloat(props.paymentAmount) / 100).toFixed(2) // Handle string
              : "0.00" // Fallback for undefined
          }
        </h3>
        <span className={styles.fontXlarge}>
          {" "}
          ~ {localStorage.getItem("formattedFiatValue")}
        </span>
        <div className="d-flex justify-content-center">
          <table className={`my-3 w-100 ${styles.printTable}`}>
            <tbody>
              <tr>
                <td className={`py-3 border-bottom ${styles.fontMedium}`}>Paid To</td>
                <td className={`py-3 border-bottom ${styles.fontMedium}`}>
                  {props.username}
                </td>
              </tr>
              <tr>
                <td className={`py-3 border-bottom ${styles.fontMedium}`}>Paid On</td>
                <td className={`py-3 border-bottom ${styles.fontMedium}`}>
                  {formattedDate(new Date())} at <span>{formattedTime(new Date())}</span>
                </td>
              </tr>
              <tr>
                <td className={`py-3 border-bottom ${styles.fontMedium}`}>Status</td>
                <td className={`py-3 border-bottom ${styles.fontMedium}`}>Paid</td>
              </tr>
              <tr>
                <td className={`py-3 border-bottom ${styles.fontMedium}`}>Description</td>
                <td className={`py-3 border-bottom ${styles.fontMedium}`}>
                  {props.memo ? props.memo : "none"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Receipt
