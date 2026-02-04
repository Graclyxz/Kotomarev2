import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'animeflv.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www3.animeflv.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.animeflv.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 's4.anilist.co',
        pathname: '/file/**',
      },
      {
        protocol: 'https',
        hostname: '*.anilist.co',
        pathname: '/file/**',
      },
    ],
  },
};

export default nextConfig;
