import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos"
      },
      {
        protocol: "https",
        hostname: "assets.td.org"
      },
      {
        protocol: "https",
        hostname: "s7d1.scene7.com"
      },
      {
        protocol: "https",
        hostname: "bntnews.bg"
      },
      {
        protocol: "https",
        hostname: "www.droidshop.vn"
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io"
      }
    ]
  }
};

export default nextConfig;
