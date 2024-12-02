import React from "react"
import Card from "react-bootstrap/Card"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { useRouter } from "next/router"
import { gql, useQuery } from "@apollo/client"
import CurrencyDropdown from "../components/Currency/currency-dropdown"
import styles from "../styles/Home.module.css"

const GET_NODE_STATS = gql`
  query nodeIds {
    globals {
      nodesIds
    }
  }
`

function Home({ onStart }: { onStart: () => void }) {
  const { loading, error, data } = useQuery(GET_NODE_STATS)
  const router = useRouter()
  const [selectedDisplayCurrency, setSelectedDisplayCurrency] = React.useState(
    localStorage.getItem("display") ?? "JMD",
  )
  const [username, setUsername] = React.useState<string>("")

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    router.push(
      {
        pathname: username,
        query: { display: selectedDisplayCurrency },
      },
      undefined,
      { shallow: true },
    )
    onStart() // Trigger the menu visibility
  }

  return (
    <div className={styles.home}>
      <Container className={styles.container}>
        <h2 className={styles.title}>FLASH POINT OF SALE</h2>
        <Card className={styles.card}>
          <Card.Body>
            <form className={styles.form} onSubmit={handleSubmit}>
              <label htmlFor="username" className={styles.label}>
                <strong>Enter your Flash username</strong>
              </label>
              <input
                type="text"
                name="username"
                style={{
                  width: "100%", // Ensures it spans the container width
                  maxWidth: "100%", // Prevents overflow beyond screen width
                  padding: "15px 20px", // Adds better padding for usability
                  fontSize: "18px", // Larger font for readability
                  lineHeight: "1.5", // Ensures text is not cramped
                  boxSizing: "border-box", // Includes padding and border in the width
                  border: "3px solid #ccc", // Light border for visibility
                  borderRadius: "10px", // Rounded corners for a modern look
                  marginBottom: "20px", // Adds space between the input and button
                }}
                className={styles.input}
                value={username}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setUsername(event.target.value)
                }
                placeholder="Enter your flash username"
                required
              />
              <label htmlFor="display" className={styles.label}>
                <strong>Enter your currency $</strong>
              </label>
              <div className={styles.dropdown}>
                <CurrencyDropdown
                  name="display"
                  style={{
                    width: "100%", // Ensures it spans the container width
                    maxWidth: "100%", // Prevents overflow beyond screen width
                    padding: "15px 20px", // Adds better padding for usability
                    fontSize: "18px", // Larger font for readability
                    lineHeight: "1.5", // Ensures text is not cramped
                    boxSizing: "border-box", // Includes padding and border in the width
                    border: "3px solid #ccc", // Light border for visibility
                    borderRadius: "10px", // Rounded corners for a modern look
                    appearance: "none", // Removes the default browser styles
                    background: `white url('/icons/dropdown-arrow-button.png') no-repeat right 15px center`, // Custom arrow
                    backgroundSize: "40px", // Size of the arrow
                  }}
                  onSelectedDisplayCurrencyChange={(newDisplayCurrency) => {
                    if (newDisplayCurrency) {
                      localStorage.setItem("display", newDisplayCurrency)
                      setSelectedDisplayCurrency(newDisplayCurrency)
                    }
                  }}
                />
              </div>
              <button type="submit" className={styles.submitButton}>
                Start
              </button>
            </form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}

export default Home
