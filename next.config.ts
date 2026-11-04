import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.STUDYDESK_AUTH_TEST === "1" ? ".next-auth-test" : ".next",
  allowedDevOrigins: ["127.0.0.1", "localhost", ...(process.env.DEV_LAN_HOST ? [process.env.DEV_LAN_HOST] : [])],
  turbopack: { root: process.cwd() },
};

export default nextConfig;
