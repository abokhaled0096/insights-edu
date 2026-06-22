import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "http://localhost:3000",
    "192.168.1.5",
    "192.168.137.1",
    "10.123.127.144",
    "10.123.127.184",
    "10.123.127.185",
    "10.123.127.208",
  ],
};

export default nextConfig;
