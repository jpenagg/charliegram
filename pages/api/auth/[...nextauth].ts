import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { validateEnvVars } from '../../../utils/env'

// Validate environment variables
try {
  validateEnvVars()
} catch (error) {
  console.error('\n\n🚨 Environment Variable Error 🚨\n')
  console.error(error)
  console.error('\n')
  // In development, we'll show the error. In production, we'll show a generic error
  if (process.env.NODE_ENV === 'development') {
    throw error
  }
}

// This would typically come from an environment variable
const ADMIN_USERNAME = process.env.ADMIN_USERNAME
// This should be a hashed password in production
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (
          credentials?.username === process.env.ADMIN_USERNAME &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: '1', name: 'Admin' }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/auth/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
}

export default NextAuth(authOptions) 