import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    // Safely construct the API destination
    const apiBase = process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3001';
    
    return [
      {
        source: '/pos/:path*',
        destination: 'https://ali-mobile-repair-pos-g2by.vercel.app/:path*',
      },
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
