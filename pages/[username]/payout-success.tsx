import React from "react"
import { useRouter } from "next/router"
import styles from "./payout-success.module.css"
import { Image } from "react-bootstrap"

function PayoutSuccess() {
  const router = useRouter()

  const handleBack = () => {
    router.push("/rewards")
  }

  return (
    <div className={styles.container}>
      <div className={styles.successGraphic}>
        {/* You can replace this with an actual graphic or image */}
        <Image src="/rewards.jpg" width={"300"} height={"250"} />
      </div>
      <h1 className={styles.successMessage}>Payment Successful!</h1>
      <button onClick={handleBack} className={styles.backButton}>
        Back to Rewards
      </button>
    </div>
  )
}

export default PayoutSuccess
