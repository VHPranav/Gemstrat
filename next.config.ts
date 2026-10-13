import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A static site: `next build` writes plain HTML/CSS/JS to out/, which
  // Cloudflare serves as-is (see wrangler.jsonc). Nothing runs on a server.
  output: 'export',
  // Let phones on the local network open the dev server (http://192.168.1.9:3000).
  // Without this Next.js blocks its dev resources for them and the page
  // half-loads. Update the address if this computer's local IP changes.
  allowedDevOrigins: ['192.168.1.9'],
  images: {
    // No image server in a static export: images are served as they are
    // (they're already compressed WebP)
    unoptimized: true,
  },
};

export default nextConfig;
