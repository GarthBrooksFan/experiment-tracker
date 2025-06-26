/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for Railway
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  
  // Optimize for production
  swcMinify: true,
  
  // Images configuration for Railway
  images: {
    domains: ['avatars.githubusercontent.com'], // For GitHub OAuth avatars
  },
  
  // Environment variables validation
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  }
}

module.exports = nextConfig
