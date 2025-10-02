import '../styles/globals.css'
import '../lib/fontawesome'
import { AppProps } from 'next/app'

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
