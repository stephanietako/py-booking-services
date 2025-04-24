import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
        pathname: "**",
      },
    ],
  },
  eslint: {
    dirs: ["pages, components", "lib"], // Vérifie les répertoires où ESLint doit s'exécuter
  },
};

export default nextConfig;
