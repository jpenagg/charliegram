export function validateEnvVars() {
  const required = [
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'CLOUDINARY_FOLDER',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD'
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n` +
      missing.map(key => `  - ${key}`).join('\n') +
      `\n\nMake sure these are set in your .env.local file for development ` +
      `or in your Vercel project settings for production.`
    )
  }

  // Validate NEXTAUTH_SECRET in production
  if (process.env.NODE_ENV === 'production' && 
      process.env.NEXTAUTH_SECRET === 'your-super-secret-key-change-this-in-production') {
    throw new Error(
      'Default NEXTAUTH_SECRET detected in production!\n' +
      'Please change this to a secure random string in your production environment variables.'
    )
  }

  // Validate NEXTAUTH_URL format
  try {
    new URL(process.env.NEXTAUTH_URL!)
  } catch {
    throw new Error(
      'Invalid NEXTAUTH_URL format. Must be a valid URL like:\n' +
      '  - Development: http://localhost:3000\n' +
      '  - Production: https://your-domain.com'
    )
  }
} 