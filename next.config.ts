import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [{ source: "/about", destination: "/", permanent: true }];
  },
};

export default nextConfig;
