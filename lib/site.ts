/**
 * URL pública do site. Enquanto o domínio próprio não existir, a Vercel injeta
 * VERCEL_PROJECT_PRODUCTION_URL no build. O fallback só vale em desenvolvimento.
 */
export const URL_SITE = process.env.NEXT_PUBLIC_URL_SITE
  ? process.env.NEXT_PUBLIC_URL_SITE
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000'
