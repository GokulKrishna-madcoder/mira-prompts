import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  turbopack: {
    root: process.cwd(), // Resolves the turbopack.root warning
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wvgbyxwlxcetayjqenjc.supabase.co',
      },
    ],
  },
};

export default nextConfig;
