import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next-local",
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;

