import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Responsive AVIF/WebP variants, so phones download small images
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
