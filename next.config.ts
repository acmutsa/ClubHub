import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  trustedOrigins: ["https://*.localhost:3000"],
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
      },
    ],
  },
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
