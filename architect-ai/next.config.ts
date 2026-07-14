import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  turbopack: {},
  typescript: {
    // Next.js 16 Turbopack generates a validator that incorrectly references .js
    // instead of .tsx for page files — skip type checking at build time.
    ignoreBuildErrors: true,
  },

  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    return config;
  },
};

export default nextConfig;
