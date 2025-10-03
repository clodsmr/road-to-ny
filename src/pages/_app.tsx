// pages/_app.tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css' // Import CSS FA
config.autoAddCss = false // Disabilita l'aggiunta automatica del CSS

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
