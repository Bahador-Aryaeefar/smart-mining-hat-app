// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^http?:\/\/192\.168\.0\.1\/sensors/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'esp32-data',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /^http?.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
});

module.exports = withPWA({
  reactStrictMode: true,

  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
      },
    ];
  },
});
