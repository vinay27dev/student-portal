/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add an empty turbopack block to silence the build block error
  experimental: {
    turbopack: {}
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;