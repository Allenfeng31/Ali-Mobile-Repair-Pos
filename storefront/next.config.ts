import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/pos/:path*',
        destination: 'https://ali-mobile-repair-pos-g2by.vercel.app/:path*',
      },
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
