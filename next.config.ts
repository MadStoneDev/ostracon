import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Let's redirect login and register to /auth
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/auth",
        permanent: false,
      },
      {
        source: "/register",
        destination: "/auth",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
