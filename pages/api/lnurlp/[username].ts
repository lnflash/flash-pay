import originalUrl from "original-url"
import {
  ApolloClient,
  ApolloLink,
  concat,
  gql,
  HttpLink,
  InMemoryCache,
} from "@apollo/client"
import type { NextApiRequest, NextApiResponse } from "next"

import { requestPayServiceParams } from "lnurl-pay"

import { GRAPHQL_URI_INTERNAL, NOSTR_PUBKEY } from "../../../lib/config"

const ipForwardingMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      "x-real-ip": operation.getContext()["x-real-ip"],
      "x-forwarded-for": operation.getContext()["x-forwarded-for"],
    },
  }))

  return forward(operation)
})

const client = new ApolloClient({
  link: concat(
    ipForwardingMiddleware,
    new HttpLink({
      uri: GRAPHQL_URI_INTERNAL,
    }),
  ),
  cache: new InMemoryCache(),
})

const LNURL_DEFAULT_WALLET = gql`
  query accountDefaultWallet($username: Username!, $walletCurrency: WalletCurrency!) {
    accountDefaultWallet(username: $username, walletCurrency: $walletCurrency) {
      __typename
      id
      walletCurrency
      lnurlp
    }
  }
`
const getLnurl = async (accountUsername: string, req: NextApiRequest) => {
  try {
    const { data } = await client.query({
      query: LNURL_DEFAULT_WALLET,
      variables: { username: accountUsername, walletCurrency: "USD" },
      context: {
        "x-real-ip": req.headers["x-real-ip"],
        "x-forwarded-for": req.headers["x-forwarded-for"],
      },
    })
    console.log(data)
    return data?.accountDefaultWallet?.lnurlp
  } catch (err) {
    console.log("error getting lnurl for user:", err)
    return undefined
  }
}

// const nostrEnabled = !!NOSTR_PUBKEY

// if (nostrEnabled) {
//   const connectionObj = {
//     sentinelPassword: process.env.REDIS_PASSWORD,
//     sentinels: [
//       {
//         host: `${process.env.REDIS_0_DNS}`,
//         port: Number(process.env.REDIS_0_SENTINEL_PORT) || 26379,
//       },
//       {
//         host: `${process.env.REDIS_1_DNS}`,
//         port: Number(process.env.REDIS_1_SENTINEL_PORT) || 26379,
//       },
//       {
//         host: `${process.env.REDIS_2_DNS}`,
//         port: Number(process.env.REDIS_2_SENTINEL_PORT) || 26379,
//       },
//     ],
//     name: process.env.REDIS_MASTER_NAME ?? "mymaster",
//     password: process.env.REDIS_PASSWORD,
//   }

//   redis = new Redis(connectionObj)

//   redis.on("error", (err) => console.log({ err }, "Redis error"))
// }
 
export default async function (req: NextApiRequest, res: NextApiResponse) {
  // console.log(NOSTR_PUBKEY)

  const { username, nostr } = req.query

  if (!username) {
    return res.status(400).end("username is required")
  }
  const accountUsername = username ? username.toString() : ""

  console.log(`accountUsername = ${accountUsername}`)
  const lnurl = await getLnurl(accountUsername, req)
  if (!lnurl) {
    return res.json({
      status: "ERROR",
      reason: `Couldn't find user '${username}'.`,
    })
  }

   
  const details = await requestPayServiceParams({ lnUrlOrAddress: lnurl })
  if (!details) {
    console.log(`Failed to parse: ${lnurl}`)
    return res.status(500).end()
  }

  // Response must meet LUD-6 requirements: https://github.com/lnurl/luds/blob/luds/06.md
  return res.json({
      callback: details.callback, 
      maxSendable: details.max, 
      minSendable: details.min, 
      metadata: details.metadata, 
      tag: "payRequest",
      domain: details.domain,
      description: details.description,
      image: details.image,
      commentAllowed: details.commentAllowed,
      identifier: `${accountUsername}@${originalUrl(req).hostname}` // not part of lud6 
  })
  
  // const metadata = JSON.stringify([
  //   ["text/plain", `Payment to ${accountUsername}`],
  //   ["text/identifier", `${accountUsername}@${url.hostname}`],
  // ])

  //     ...(nostrEnabled
  //       ? {
  //           allowsNostr: true,
  //           nostrPubkey: NOSTR_PUBKEY,
  //         }
  //       : {}),
  //   })
  // }

  //   if (nostrEnabled && nostr) {
  //     descriptionHash = crypto.createHash("sha256").update(nostr).digest("hex")
  //   } else {
  //     descriptionHash = crypto.createHash("sha256").update(metadata).digest("hex")
  //   }

  //   if (nostrEnabled && nostr && redis) {
  //     redis.set(`nostrInvoice:${invoice.paymentHash}`, nostr, "EX", 1440)
  //   }

}