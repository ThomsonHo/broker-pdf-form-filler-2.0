/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
  transpilePackages: ['react-pdf'],
};

module.exports = nextConfig; 