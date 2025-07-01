// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   reactStrictMode: true,
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "img.clerk.com",
//         pathname: "**",
//       },
//       {
//         protocol: "https",
//         hostname: "nvxgkcpklrpibhprbhzb.supabase.co",
//         pathname: "**",
//       },
//     ],
//   },
//   eslint: {
//     dirs: ["pages, components", "lib"], // Vérifie les répertoires où ESLint doit s'exécuter
//   },

// };

// export default nextConfig;
// next.config.ts
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
      {
        protocol: "https",
        hostname: "nvxgkcpklrpibhprbhzb.supabase.co",
        // port: "", // Laissez vide comme vous l'avez fait
        pathname: "/storage/v1/object/public/**", // <-- Simplifiez juste pour le test
      },
    ],
  },
  eslint: {
    dirs: ["pages", "components", "lib"], // Corrigé: chaque dossier séparé
  },
};

export default nextConfig;
