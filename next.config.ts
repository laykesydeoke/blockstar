import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === "development",
  },

  // Transpile @stacks packages to ensure proper bundling in production
  transpilePackages: [
    "@stacks/connect",
    "@stacks/network",
    "@stacks/transactions",
    "@stacks/common",
  ],
};

export default nextConfig;
