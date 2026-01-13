import type { NextConfig } from "next";

// Configuração do Next.js
const nextConfig: NextConfig = {
  async headers() {
    if (process.env.NODE_ENV === 'development') return [];

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https://*.supabase.co https://*.supabase.in",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https://*.supabase.co",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in"
            ].join('; ')
          }
        ],
      },
    ];
  },
};

export default nextConfig;
