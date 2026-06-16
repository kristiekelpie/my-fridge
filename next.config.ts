import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow testing on phone via local network IP during dev
  allowedDevOrigins: ["192.168.0.19", "192.168.0.0/24"],
};

export default nextConfig;
