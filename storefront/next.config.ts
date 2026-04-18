import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/services/:path*',
        destination: '/repairs/:path*',
        permanent: true,
      },
      {
        source: '/repairs/iphone/:path*',
        destination: '/repairs/phone/iphone/:path*',
        permanent: true,
      },
      {
        source: '/repairs/iphone',
        destination: '/repairs/phone/iphone',
        permanent: true,
      },
      {
        source: '/repairs/ipad/:path*',
        destination: '/repairs/tablet/ipad/:path*',
        permanent: true,
      },
      {
        source: '/repairs/ipad',
        destination: '/repairs/tablet/ipad',
        permanent: true,
      },
      {
        source: '/repairs/macbook/:path*',
        destination: '/repairs/laptop/macbook/:path*',
        permanent: true,
      },
      {
        source: '/repairs/macbook',
        destination: '/repairs/laptop/macbook',
        permanent: true,
      }
    ];
  },
};

export default nextConfig;
