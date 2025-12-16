import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  trustedOrigins: ["https://*.localhost:3000"],
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
