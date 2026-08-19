import type { NextConfig } from "next";
import type { Configuration } from "webpack";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const seoYear = new Date().getMonth() < 10
  ? new Date().getFullYear()
  : new Date().getFullYear() + 1;

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
    minimumCacheTTL: 86400,
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

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/schedule',
        destination: `/schedule/${seoYear}`,
        permanent: true,
      },
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.workevent.ru' }],
        destination: 'https://workevent.ru/:path*',
        permanent: true,
      },
    ]
  },
});

export default nextConfig;
