import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "media*.giphy.com",
      },
      {
        protocol: "https",
        hostname: "i.giphy.com",
      },
    ],
  },
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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' js.stripe.com challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' *.supabase.co *.supabase.in *.ostracon.app data: blob: *.stripe.com media*.giphy.com i.giphy.com",
              "font-src 'self'",
              "connect-src 'self' *.supabase.co *.supabase.in *.ostracon.app *.upstash.io wss://*.supabase.co wss://*.ostracon.app api.stripe.com api.giphy.com",
              "frame-src 'self' js.stripe.com hooks.stripe.com challenges.cloudflare.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
