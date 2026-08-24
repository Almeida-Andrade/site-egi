import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.0.1.74', '10.0.1.*'],
  images: {
    remotePatterns: [
      // Todas as fotos vivem no bucket `imoveis` do banco do CRM (migradas em 20/08/2026)
      {
        protocol: 'https',
        hostname: 'yamjyyidqtkbwujnaiec.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
