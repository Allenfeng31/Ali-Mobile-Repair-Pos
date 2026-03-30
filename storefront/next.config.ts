import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    let apiBase = process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3001';
    if (apiBase && !apiBase.startsWith('http://') && !apiBase.startsWith('https://')) {
      apiBase = `https://${apiBase}`;
    }
    apiBase = apiBase.replace(/\/+$/, '');

    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
