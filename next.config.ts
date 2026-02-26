import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,

  // Tree-shake heavy packages — eliminates unused icons from bundle
  experimental: {
    optimizePackageImports: ["lucide-react", "radix-ui"],
  },

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 604800, // 7 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
    ],
    // Include w780 for tablet/mobile hero images (TMDB standard sizes)
    deviceSizes: [640, 750, 780, 828, 1080, 1200, 1280, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
