import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Tysta varning om flera lockfiler — ankra till denna app-mapp
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
