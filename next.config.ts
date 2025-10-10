import { type NextConfig } from "next";

import "@/env";

const nextConfig: NextConfig = {
  typedRoutes: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              icon: true,
            },
          },
        ],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
