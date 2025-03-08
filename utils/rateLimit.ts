import { NextApiRequest, NextApiResponse } from 'next'

interface RateLimitInfo {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitInfo>()

export default async function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: Function
) {
  // Only apply rate limiting to credential authentication
  if (req.method === 'POST' && req.body?.username && req.body?.password) {
    // Get IP address
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
    const now = Date.now()
    
    // Clean up expired entries
    Array.from(rateLimitMap.entries()).forEach(([key, value]) => {
      if (value.resetTime < now) {
        rateLimitMap.delete(key)
      }
    })

    // Check existing rate limit info
    const rateLimit = rateLimitMap.get(ip as string)
    
    if (rateLimit) {
      // If time window has expired, reset the counter
      if (rateLimit.resetTime < now) {
        rateLimitMap.set(ip as string, {
          count: 1,
          resetTime: now + 15 * 60 * 1000 // 15 minutes
        })
      } else {
        // If we've exceeded the rate limit
        if (rateLimit.count >= 5) {
          const timeRemaining = Math.ceil((rateLimit.resetTime - now) / 1000 / 60)
          return res.status(429).json({
            error: `Too many login attempts. Please try again in ${timeRemaining} minutes.`
          })
        }
        
        // Increment the counter
        rateLimit.count++
      }
    } else {
      // First attempt for this IP
      rateLimitMap.set(ip as string, {
        count: 1,
        resetTime: now + 15 * 60 * 1000 // 15 minutes
      })
    }

    // Add rate limit headers
    const currentLimit = rateLimitMap.get(ip as string)
    if (currentLimit) {
      res.setHeader('X-RateLimit-Limit', '5')
      res.setHeader('X-RateLimit-Remaining', Math.max(0, 5 - currentLimit.count))
      res.setHeader('X-RateLimit-Reset', currentLimit.resetTime)
    }
  }

  // Process the request
  return handler(req, res)
} 