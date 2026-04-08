import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-pdf/renderer', 'puppeteer'],
  devIndicators: false,
};

export default nextConfig;
