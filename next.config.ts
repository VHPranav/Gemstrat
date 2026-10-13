import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Let phones on the local network open the dev server (http://192.168.1.9:3000).
  // Without this Next.js blocks its dev resources for them and the page
  // half-loads. Update the address if this computer's local IP changes.
  allowedDevOrigins: ['192.168.1.9'],
  images: {
    // Responsive AVIF/WebP variants, so phones download small images
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
