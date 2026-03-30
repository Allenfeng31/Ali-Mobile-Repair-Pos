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
    ];
  },
};

export default nextConfig;
