import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    // Serve IndexNow key at standard /{key}.txt path
    const key = process.env.INDEXNOW_API_KEY;
    return key
      ? [{ source: `/${key}.txt`, destination: "/api/indexnow-key" }]
      : [];
  },
};

export default nextConfig;
