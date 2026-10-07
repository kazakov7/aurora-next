/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3007',
    REACT_APP_API_GRAPHQL_URL: process.env.REACT_APP_API_GRAPHQL_URL || 'http://localhost:3007/graphql',
    REACT_APP_API_WS: process.env.REACT_APP_API_WS || 'ws://127.0.0.1:3007',
  },
};

module.exports = nextConfig;
