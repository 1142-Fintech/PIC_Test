import { ChakraProvider, useColorMode } from "@chakra-ui/react"
import Navbar from "@components/Header"
import { AuthProvider } from "@hooks/auth"
import { CartProvider } from "@hooks/cart/cart"
import type { AppProps } from "next/app"
import Head from "next/head"
import { useEffect } from "react"
import "../globals.css"
import theme from "../theme"

function ColorModeSync() {
  const { colorMode } = useColorMode()
  useEffect(() => {
    if (colorMode === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [colorMode])
  return null
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta content="IE=edge" httpEquiv="X-UA-Compatible" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <title>Foodomo 校園強化版</title>
      </Head>
      <AuthProvider>
        <ChakraProvider theme={theme}>
          <ColorModeSync />
          <CartProvider>
            <Navbar />
            <main className="w-full pt-16">
              <Component {...pageProps} />
            </main>
          </CartProvider>
        </ChakraProvider>
      </AuthProvider>
    </>
  )
}
