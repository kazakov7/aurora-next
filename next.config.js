/** @type {import('next').NextConfig} */
const productionApiUrl = 'https://auroraexplore.up.railway.app';
const defaultApiUrl = process.env.NODE_ENV === 'production' ? productionApiUrl : 'http://localhost:3007';
const apiUrl = process.env.NEXT_PUBLIC_AURORA_API_URL || process.env.REACT_APP_API_URL || defaultApiUrl;
const graphqlUrl =
  process.env.NEXT_PUBLIC_AURORA_GRAPHQL_URL ||
  process.env.REACT_APP_API_GRAPHQL_URL ||
  `${apiUrl.replace(/\/$/, '')}/graphql`;

/** Every page: no MIME sniffing, no framing by other sites, no full URL sent to other origins. HSTS belongs to nginx **/
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The app shows its images with plain <img> tags, so the built-in optimizer is not used. Turning it off
  // keeps the /_next/image endpoint from processing remote images (Next 14 advisories on that path)
  images: { unoptimized: true },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  i18n: {
    locales: ['en', 'ko', 'uz'],
    defaultLocale: 'en',
    localeDetection: false,
  },
  env: {
    REACT_APP_API_URL: apiUrl,
    REACT_APP_API_GRAPHQL_URL: graphqlUrl,
    REACT_APP_API_WS: process.env.NEXT_PUBLIC_AURORA_SOCKET_URL || process.env.REACT_APP_API_WS || 'ws://127.0.0.1:3007',
  },
};

module.exports = nextConfig;
