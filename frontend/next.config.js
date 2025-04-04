/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure webpack if needed
  webpack: (config, { isServer }) => {
    // Add any custom webpack configurations here
    return config;
  },
  // Configure image domains if needed
  images: {
    domains: []
  }
};

module.exports = nextConfig; 