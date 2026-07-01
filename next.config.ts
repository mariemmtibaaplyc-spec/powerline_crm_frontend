import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // better-sqlite3 is a native module — must stay server-side only
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
