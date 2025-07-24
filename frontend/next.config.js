/** @type {import('next').NextConfig} */
const nextConfig = {
  
  // Performance optimizations for development
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Reduce file watching overhead
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
      
      // Faster builds in development
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }
    
    return config;
  },
  
  // Enable quality checks for production builds
  
  // Faster compilation
  swcMinify: true,
  
  experimental: {
    // Only essential experimental features
    serverComponentsExternalPackages: ['bcryptjs'],
  },
};

module.exports = nextConfig;