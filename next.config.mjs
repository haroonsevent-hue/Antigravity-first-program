/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS || false;

const nextConfig = {
  // Allow external images (Unsplash hero fallback)
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

if (isGithubActions) {
  // Settings for GitHub Pages
  nextConfig.output = 'export';
  nextConfig.basePath = '/Antigravity-first-program';
  nextConfig.trailingSlash = true;
} else {
  // Settings for local development with backend
  nextConfig.rewrites = async () => {
    return [
      { source: '/api/:path*', destination: 'http://localhost:3001/api/:path*' },
      { source: '/uploads/:path*', destination: 'http://localhost:3001/uploads/:path*' },
    ];
  };
}

export default nextConfig;
