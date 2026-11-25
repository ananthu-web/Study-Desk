import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Installed apps may outlive a deployment; mismatches trigger a fresh document.
  deploymentId: process.env.NEXT_DEPLOYMENT_ID || process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA,
  distDir: process.env.STUDYDESK_AUTH_TEST === "1" ? ".next-auth-test" : ".next",
  allowedDevOrigins: ["127.0.0.1", "localhost", ...(process.env.DEV_LAN_HOST ? [process.env.DEV_LAN_HOST] : [])],
  turbopack: { root: process.cwd() },
};

export default nextConfig;
