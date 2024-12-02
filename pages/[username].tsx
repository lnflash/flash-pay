import Link from "next/link"
import { useRouter } from "next/router"
import React from "react"
import Container from "react-bootstrap/Container"
import Image from "react-bootstrap/Image"

import ParsePayment from "../components/ParsePOSPayment"
import PinToHomescreen from "../components/PinToHomescreen"
import reducer, { ACTIONS } from "./_reducer"
import styles from "./_user.module.css"
import Head from "next/head"
import CurrencyDropdown from "../components/Currency/currency-dropdown"
import { gql } from "@apollo/client"
import { useAccountDefaultWalletsQuery } from "../lib/graphql/generated"
import LoadingComponent from "../components/loading"

gql`
  query accountDefaultWallets($username: Username!) {
    accountDefaultWallet(username: $username) {
      __typename
      id
      walletCurrency
    }
  }
`

function ReceivePayment({ onHideMenu }: { onHideMenu: () => void }) {
  const router = useRouter()
  const { username, memo, display } = router.query

  const [state, dispatch] = React.useReducer(reducer, {
    currentAmount: "",
    createdInvoice: false,
    walletCurrency: "USD",
    username: username?.toString() || "",
    pinnedToHomeScreenModalVisible: false,
  })

  const {
    data,
    loading,
    error: usernameError,
  } = useAccountDefaultWalletsQuery({
    variables: { username: username?.toString() || "" },
  })

  React.useEffect(() => {
    if (data?.accountDefaultWallet.walletCurrency) {
      dispatch({
        type: ACTIONS.UPDATE_WALLET_CURRENCY,
        payload: data.accountDefaultWallet.walletCurrency,
      })
    }
  }, [data])

  return (
    <Container className={styles.paymentContainer}>
      <Head>
        <link rel="manifest" href={`/api/${username}/manifest`} id="manifest" />
      </Head>
      {loading ? (
        <LoadingComponent />
      ) : usernameError ? (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{`${usernameError.message}`}</p>
          <button
            className={styles.goBackButton}
            onClick={() => {
              onHideMenu()
              router.replace("/")
            }}
          >
            Go Back
          </button>
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <button
              className={styles.backButton}
              onClick={() => {
                onHideMenu()
                localStorage.setItem("menuVisible", "false") // Hide the menu
                router.replace("/")
              }}
            >
              <Image
                src="/icons/chevron-left-icon.svg"
                alt="Back"
                width="24px"
                height="24px"
              />
            </button>
            <h1 className={styles.username}>{`Pay ${username}`}</h1>
            <CurrencyDropdown
              style={{
                width: "80px",
                height: "42px",
                border: "none",
                borderRadius: "5px",
                fontSize: "18px",
                textAlign: "center",
                appearance: "none",
              }}
              showOnlyFlag
              onSelectedDisplayCurrencyChange={(newDisplayCurrency) => {
                localStorage.setItem("display", newDisplayCurrency)
                router.push(
                  {
                    query: { ...router.query, display: newDisplayCurrency },
                  },
                  undefined,
                  { shallow: true },
                )
                setTimeout(() => {
                  window.location.reload()
                }, 100)
              }}
            />
          </div>

          <div className={styles.body}>
            {/* Render payment parsing component */}
            <ParsePayment
              state={state}
              dispatch={dispatch}
              defaultWalletCurrency={data?.accountDefaultWallet.walletCurrency}
              walletId={data?.accountDefaultWallet.id}
            />
          </div>
        </>
      )}
    </Container>
  )
}

export default ReceivePayment
