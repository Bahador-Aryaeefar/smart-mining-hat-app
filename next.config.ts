// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  reactStrictMode: true,

  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true, // Permanent redirect (301 status code)
      },
    ];
  },
});
