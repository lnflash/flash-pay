import "./index.css"

import { NextPage } from "next"
import dynamic from "next/dynamic"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect } from "react"

import { APP_DESCRIPTION } from "../config/config"
import { ReduxProvider } from "../src/providers/ReduxProvider"
import { ThemeProvider } from "../src/providers/ThemeProvider"

const GraphQLProvider = dynamic(() => import("../lib/graphql"), { ssr: false })
const AppLayout = dynamic(() => import("../components/Layouts/AppLayout"), { ssr: false })
const InstallPrompt = dynamic(() => import("../src/components/pwa/InstallPrompt").then(mod => mod.InstallPrompt), { ssr: false })

export default function Layout({
  Component,
  pageProps,
}: {
  Component: NextPage
  pageProps: Record<string, unknown>
}) {
  const { username } = useRouter().query
  
  useEffect(() => {
    // Register service worker in production
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/service-worker.js')
    }
  }, [])
  
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="description" content={APP_DESCRIPTION} />
        <meta name="theme-color" content="#FF9500" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Flash POS" />
        <link rel="apple-touch-icon" href="/FLASH-ICON.png" />
        <link rel="icon" type="image/png" href="/FLASH-ICON.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=UA-181044262-1"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'UA-181044262-1');
    `,
          }}
        />
        <title>Flash POS</title>
      </Head>
      <ReduxProvider>
        <ThemeProvider>
          <GraphQLProvider>
            <InstallPrompt />
            <AppLayout username={username}>
              <Component {...pageProps} />
            </AppLayout>
          </GraphQLProvider>
        </ThemeProvider>
      </ReduxProvider>
    </>
  )
}
