import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isHomePage = router.pathname === '/'

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <Nav />
        <Component {...pageProps} />
        {isHomePage && <Footer />}
      </div>
    </ThemeProvider>
  )
}
