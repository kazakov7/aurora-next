/** @type {import('next').NextConfig} */
const productionApiUrl = 'https://auroraexplore.up.railway.app';
const defaultApiUrl = process.env.NODE_ENV === 'production' ? productionApiUrl : 'http://localhost:3007';
const apiUrl = process.env.NEXT_PUBLIC_AURORA_API_URL || process.env.REACT_APP_API_URL || defaultApiUrl;
const graphqlUrl =
  process.env.NEXT_PUBLIC_AURORA_GRAPHQL_URL ||
  process.env.REACT_APP_API_GRAPHQL_URL ||
  `${apiUrl.replace(/\/$/, '')}/graphql`;

const nextConfig = {
  reactStrictMode: true,
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
