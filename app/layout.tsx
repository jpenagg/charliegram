import type { Metadata, Viewport } from 'next'
import { Atkinson_Hyperlegible_Next, Young_Serif } from 'next/font/google'
import './globals.css'

const serif = Young_Serif({ weight: '400', subsets: ['latin'], variable: '--font-young-serif' })
const sans = Atkinson_Hyperlegible_Next({
  subsets: ['latin'],
  variable: '--font-atkinson',
  // next/font has no metrics for this family yet, so skip the adjusted fallback.
  adjustFontFallback: false,
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
})

export const metadata: Metadata = {
  title: { default: 'charliegram', template: '%s · charliegram' },
  description: 'Our family photo album.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2eadb' },
    { media: '(prefers-color-scheme: dark)', color: '#1d1b17' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
