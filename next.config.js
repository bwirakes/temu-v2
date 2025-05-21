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
        hostname: 'placehold.co',
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
      }
    ]
  },
  // Configure experimental features
  experimental: {
    optimizePackageImports: ["next-auth"]
  },
  // Exclude development-only directories and files from the build
  webpack: (config, { isServer }) => {
    // Exclude migrations and scripts from the build
    config.module.rules.push({
      test: /migrations|scripts/,
      use: 'ignore-loader'
    });

    return config;
  }
}; 