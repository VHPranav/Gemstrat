import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve AVIF first (best compression), fall back to WebP, then original
    formats: ["image/avif", "image/webp"],

    // Match actual breakpoints used in the UI
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2560],
    imageSizes: [160, 200, 230, 270, 340, 480, 800],

    // Cache optimized images for 1 year (immutable after hash changes)
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
};

export default nextConfig;
