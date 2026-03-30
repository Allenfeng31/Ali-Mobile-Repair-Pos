import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    let apiBase = process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3001';
    
    // Ensure the URL starts with a protocol
    if (apiBase && !apiBase.startsWith('http://') && !apiBase.startsWith('https://')) {
      apiBase = `https://${apiBase}`;
    }

    // Clean up trailing slashes
    apiBase = apiBase.replace(/\/+$/, '');
    
    return [
      {
        source: '/pos/:path*',
        destination: 'https://ali-mobile-repair-pos-g2by.vercel.app/pos/:path*',
      },
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
