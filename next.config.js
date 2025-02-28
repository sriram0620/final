/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config) => {
    // Ignore the ws module warnings
    config.ignoreWarnings = [
      { module: /node_modules\/ws/ }
    ];
    return config;
  }
};

module.exports = nextConfig;