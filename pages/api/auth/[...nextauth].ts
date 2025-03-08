import NextAuth, { NextAuthOptions, User, DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { validateEnvVars } from '../../../utils/env'

// Extend the session user type
declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

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
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null
        
        // Your existing auth logic here
        if (
          credentials.username === process.env.ADMIN_USERNAME &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: '1', name: 'Admin' }
        }
        return null
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
}

export default NextAuth(authOptions) 