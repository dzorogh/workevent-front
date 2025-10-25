import type { NextConfig } from "next";
import type { Configuration } from "webpack";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = withBundleAnalyzer({
  output: "standalone",
  typedRoutes: true,
  experimental: {
    cssChunking: true,
    optimizePackageImports: ['zod', '@radix-ui', 'yet-another-react-lightbox', 'react-day-picker', 'date-fns'],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  webpack: (config: Configuration) => {
    if (config.module && config.module.rules) {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      });
    }
    return config;
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'admin.workevent.ru',
      },
    ],
  },

  async redirects() {
    return [
      {
        source: '/schedule',
        destination: '/schedule/2025',
        permanent: true,
      },
    ]
  },
});

export default nextConfig;
