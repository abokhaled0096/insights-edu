import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["http://localhost:3000", "192.168.1.5", "192.168.137.1"],
};

export default nextConfig;
