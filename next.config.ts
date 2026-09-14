import type { NextConfig } from "next";
import { CV_HREF } from "./src/lib/site-identity";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async redirects() {
    return [
      { source: "/about", destination: "/", permanent: true },
      { source: "/cv", destination: CV_HREF, permanent: false },
      { source: "/resume", destination: CV_HREF, permanent: false },
      { source: "/projects/:path*", destination: "/:path*", permanent: true },
      { source: "/project/:path*", destination: "/:path*", permanent: true },
      { source: "/Projects/:path*", destination: "/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
