import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = withBundleAnalyzer({
  output: "standalone",
  experimental: {
    cssChunking: true,
    typedRoutes: true,
    optimizePackageImports: ['zod', '@radix-ui', 'yet-another-react-lightbox', 'react-day-picker', 'date-fns'],
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
  webpack(config: NextConfig) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test?.test?.('.svg'),
    )

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      },
    )

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i

    return config
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
