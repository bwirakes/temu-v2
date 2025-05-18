/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        search: ''
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        search: ''
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        search: ''
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        search: ''
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        search: ''
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        search: ''
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        search: ''
      }
    ]
  },
  // Configure experimental features
  experimental: {
    optimizePackageImports: ["next-auth"]
  }
}; 