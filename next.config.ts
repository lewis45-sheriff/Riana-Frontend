import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Pin the workspace root so Next.js doesn't walk up to the home directory.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
