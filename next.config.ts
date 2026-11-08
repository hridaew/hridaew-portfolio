import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async redirects() {
    return [
      { source: "/about", destination: "/", permanent: true },
      { source: "/classic", destination: "/", permanent: false },
      { source: "/lab/one-splat", destination: "/", permanent: false },
      { source: "/lab/one-splat-open", destination: "/", permanent: false },
      { source: "/domis/flow-reference", destination: "/domis", permanent: false },
      { source: "/domis/create-home-shot", destination: "/domis", permanent: false },
    ];
  },
};

export default nextConfig;
