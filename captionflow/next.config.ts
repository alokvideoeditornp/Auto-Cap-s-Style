import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  serverExternalPackages: [
    '@remotion/bundler', 
    '@remotion/renderer', 
    'esbuild', 
    '@esbuild/win32-x64',
    'remotion'
  ],
};

export default nextConfig;
