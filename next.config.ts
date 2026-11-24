import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Keep the whole site (pages, API, photos) out of search engines.
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, noimageindex' }],
      },
    ]
  },
}

export default nextConfig
