import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle missing modules in OpenAI Agents SDK
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "eventsource-parser/stream": false,
    };
    
    return config;
  },
};

export default nextConfig;
