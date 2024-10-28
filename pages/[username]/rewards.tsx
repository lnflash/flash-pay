import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Card from "react-bootstrap/Card"
import Container from "react-bootstrap/Container"
import originalUrl from "original-url"
import { bech32 } from "bech32"
import { Image } from "react-bootstrap"
import NFCPComponent from "../../components/ParsePOSPayment/nfcp"

export async function getServerSideProps({
  req,
  params: { username },
}: {
  req: unknown
  params: { username: string }
}) {
  const url = originalUrl(req)

  const lnurl = bech32.encode(
    "lnurl",
    bech32.toWords(
      Buffer.from(
        `${url.protocol}//${url.hostname}/.well-known/lnurlp/${username}`,
        "utf8",
      ),
    ),
    1500,
  )

  // Note: add the port to the webURL for local development
  const webURL = `${url.protocol}//${url.hostname}/${username}`

  const qrCodeURL = (webURL + "?lightning=" + lnurl).toUpperCase()

  return {
    props: {
      qrCodeURL,
      username,
      userHeader: `Flashpoint ${username}`,
    },
  }
}

export default function NFCPage({
  qrCodeURL,
  username,
  userHeader,
}: {
  lightningAddress: string
  qrCodeURL: string
  username: string
  userHeader: string
}) {
  return (
    <>
      <Container fluid>
        <br />
        <Row className="justify-content-md-center">
          <Col md="auto">
            <Card className="text-center">
              <Card.Body>
                <div className="card-content">
                  <span className="user-header">{userHeader}</span>
                  <p>{`Tap any Flashcard to receive rewards.`}</p>
                  <Image src="/contactless-icon.svg" width={"300"} height={"250"} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <br />
      </Container>

      <Row className="justify-content-center" style={{ width: "100vw", margin: 0 }}>
        <button className="print-paycode-button">Tap to Receive Rewards</button>
        <NFCPComponent />
      </Row>
    </>
  )
}
