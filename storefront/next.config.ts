import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
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
      // 1. MAIN PAGES & CORE UTILITIES
      { source: '/about_us', destination: '/about-us', permanent: true },
      { source: '/pad-tab-repair', destination: '/repairs/tablet', permanent: true },
      { source: '/mobile-phone-repair', destination: '/repairs/phone', permanent: true },
      { source: '/get-a-quote', destination: '/book-repair', permanent: true },
      { source: '/message-us', destination: '/book-repair', permanent: true },
      { source: '/shop', destination: '/', permanent: true },
      { source: '/online-shopping', destination: '/', permanent: true },
      { source: '/copy-of-online-shopping', destination: '/', permanent: true },
      { source: '/apple-price', destination: '/repairs/phone/apple', permanent: true },
      { source: '/samsung-price', destination: '/repairs/phone/samsung', permanent: true },
      { source: '/iphone-x', destination: '/repairs/phone/apple', permanent: true },
      { source: '/copy-of-lg', destination: '/repairs/phone', permanent: true },
      { source: '/lg', destination: '/repairs/phone', permanent: true },
      { source: '/sony', destination: '/repairs/phone', permanent: true },
      { source: '/htc', destination: '/repairs/phone', permanent: true },
      { source: '/shop-accessories-chargers-1', destination: '/', permanent: true },
      { source: '/shop-accessories-iring', destination: '/', permanent: true },
      { source: '/shop-accessories-cardles', destination: '/', permanent: true },
      { source: '/shop-accessories-tempered-glass', destination: '/', permanent: true },
      { source: '/shop-accessories', destination: '/', permanent: true },
      { source: '/shop-case-ipad-mini', destination: '/repairs/tablet/apple', permanent: true },
      { source: '/shop-case-iphone-6-6s', destination: '/repairs/phone/apple', permanent: true },
      { source: '/hobart-detail-p01', destination: '/', permanent: true },
      
      // 2. LEGACY BLOG POSTS
      { source: '/post/iphone-13-cases-are-available-now', destination: '/repairs/phone/apple/iphone-13', permanent: true },
      { source: '/post/full-privacy-screen-protect-available-now', destination: '/repairs/phone', permanent: true },
      { source: '/post/put-a-new-light-box', destination: '/', permanent: true },
      { source: '/post/new-setup-new-look', destination: '/', permanent: true },
      { source: '/post/we-start-our-blog', destination: '/blog', permanent: true },

      // 3. WIX PRODUCT PAGES (Wildcards - strict order required)
      { source: '/product-page/ipad-case-:slug(.*)', destination: '/repairs/tablet/apple', permanent: true },
      { source: '/product-page/:path*', destination: '/repairs/phone', permanent: true },

      // 4. EXISTING REDIRECTS
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
      },
      // 5. FLEX CABLE CONSOLIDATION REDIRECTS
      {
        source: '/repairs/:category/:brand/:model/power-button',
        destination: '/repairs/:category/:brand/:model/flex-cable',
        permanent: true,
      },
      {
        source: '/repairs/:category/:brand/:model/volume-button',
        destination: '/repairs/:category/:brand/:model/flex-cable',
        permanent: true,
      },
      {
        source: '/repairs/:category/:brand/:model/power-flex',
        destination: '/repairs/:category/:brand/:model/flex-cable',
        permanent: true,
      },
      {
        source: '/repairs/:category/:brand/:model/volume-flex',
        destination: '/repairs/:category/:brand/:model/flex-cable',
        permanent: true,
      },
      {
        source: '/repairs/:category/:brand/:model/flash',
        destination: '/repairs/:category/:brand/:model/flex-cable',
        permanent: true,
      },
      {
        source: '/repairs/:category/:brand/:model/flashlight',
        destination: '/repairs/:category/:brand/:model/flex-cable',
        permanent: true,
      },
      {
        source: '/repairs/:category/:brand/:model/flash-flex',
        destination: '/repairs/:category/:brand/:model/flex-cable',
        permanent: true,
      },
      // 6. OLD PHONES ROUTE CONSOLIDATION (Apple & Samsung)
      {
        source: '/repairs/phones/apple/:model/:repairType',
        destination: '/repairs/phone/iphone/:model/:repairType',
        permanent: true,
      },
      {
        source: '/repairs/phones/samsung/:model/:repairType',
        destination: '/repairs/phone/samsung/:model/:repairType',
        permanent: true,
      }
    ];
  },
};

export default nextConfig;
