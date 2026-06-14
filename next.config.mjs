/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Proxy API calls to the Express backend during development
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:3001/api/:path*' },
      { source: '/uploads/:path*', destination: 'http://localhost:3001/uploads/:path*' },
    ];
  },
  // Allow external images (Unsplash hero fallback)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
