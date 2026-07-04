/** @type {import('next').NextConfig} */
const nextConfig = {
  // Silence the build validation blocker by adding it at the root level
  turbopack: {}, 
  
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