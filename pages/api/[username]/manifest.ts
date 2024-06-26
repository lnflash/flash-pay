import { NextApiRequest, NextApiResponse } from "next"

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { username, memo },
  } = req

  const params = new URLSearchParams()

  if (memo) {
    params.set("memo", memo.toString())
  }

  const manifest = {
    name: "POS Cash Register",
    short_name: `${username} Register`,
    description:
      "A Bitcoin POS cash register application that connects with the merchant's wallet",
    start_url: `/${username}?${params.toString()}`,
    scope: "/",
    display: "standalone",
    background_color: "#536FF2",
    theme_color: "#536FF2",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/manifest-logo/logo72x72.svg",
        type: "image/svg",
        sizes: "72x72",
      },
      {
        src: "/manifest-logo/logo96x96.svg",
        type: "image/svg",
        sizes: "96x96",
      },
      {
        src: "/manifest-logo/logo128x128.svg",
        type: "image/svg",
        sizes: "128x128",
      },
      {
        src: "/manifest-logo/logo144x144.svg",
        type: "image/svg",
        sizes: "144x144",
      },
      {
        src: "/manifest-logo/logo152x152.svg",
        type: "image/svg",
        sizes: "152x152",
      },
      {
        src: "/manifest-logo/logo192x192.svg",
        type: "image/svg",
        sizes: "192x192",
      },
      {
        src: "/manifest-logo/logo384x384.svg",
        type: "image/svg",
        sizes: "384x384",
      },
      {
        src: "/manifest-logo/logo512x512.svg",
        type: "image/svg",
        sizes: "512x512",
      },
    ],
  }

  res.status(200).send(JSON.stringify(manifest))
}
