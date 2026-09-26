import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "kajabi-storefronts-production.kajabi-cdn.com" }],
  },
};
export default nextConfig;
