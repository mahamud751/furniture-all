import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
  images: {
    qualities: [65, 75, 80],
    remotePatterns: [
      { protocol: "https", hostname: "d3j1z37yk0dbyk.cloudfront.net" },
      { protocol: "https", hostname: "bysl-com-ilyn.s3.ap-south-1.amazonaws.com" },
    ],
  },
};

export default nextConfig;
