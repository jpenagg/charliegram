import NextAuth, { NextAuthOptions, User } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { validateEnvVars } from '../../../utils/env'
import rateLimit from '../../../utils/rateLimit'

// Extend the User type to include role
interface CustomUser extends User {
  role?: string
}

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
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
// This should be a hashed password in production
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'your-secure-password'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials) return null

        // Add a small delay to prevent timing attacks
        await new Promise(resolve => setTimeout(resolve, Math.random() * 250 + 250))

        const isValidUsername = credentials.username === process.env.ADMIN_USERNAME
        const isValidPassword = credentials.password === process.env.ADMIN_PASSWORD

        // Use constant-time comparison to prevent timing attacks
        const safeCompare = (a: string, b: string) => {
          if (a.length !== b.length) return false
          return a.split('').reduce((acc, char, i) => acc && char === b[i], true)
        }

        if (isValidUsername && safeCompare(credentials.password, process.env.ADMIN_PASSWORD!)) {
          return {
            id: '1',
            name: 'Admin',
            email: 'admin@charliegram.com',
            role: 'admin'
          }
        }

        return null
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as CustomUser).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as CustomUser).role = token.role as string
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)

export default async function auth(req: any, res: any) {
  return rateLimit(req, res, () => handler(req, res))
} 