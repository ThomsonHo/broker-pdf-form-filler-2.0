/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore ESLint during builds
  },
  typescript: {
    ignoreBuildErrors: false, // Keep TypeScript checks
  },
  experimental: {
    // appDir is no longer needed in Next.js 14
  },
  // Configure webpack if needed
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // Configure image domains if needed
  images: {
    domains: []
  },
  // Exclude test files from the build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].filter(ext => !ext.includes('test')),
};

module.exports = nextConfig; 