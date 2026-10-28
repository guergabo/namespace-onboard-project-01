import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // A self-contained server in .next/standalone, which the Docker image runs.
  output: "standalone",
  // The dev server is opened through the Devbox's devbox.so URL; without this, Next blocks its
  // dev-only requests from that origin and the page never becomes interactive.
  allowedDevOrigins: ["*.devbox.so"],
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
