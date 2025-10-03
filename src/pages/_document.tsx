import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="it">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E0218A;" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
