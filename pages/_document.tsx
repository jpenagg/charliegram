import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      <body className="antialiased bg-white dark:bg-gray-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
