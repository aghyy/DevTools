import type { NextConfig } from 'next'
import { loadEnvConfig } from '@next/env'
import { resolve } from 'path'

loadEnvConfig(resolve(process.cwd(), '..'))

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig