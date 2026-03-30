import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    // Force https:// if not present in the URL
    let apiBase = process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3001';
    if (apiBase.startsWith('ali-mobile-repair')) {
      apiBase = `https://${apiBase}`;
    }
    
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
