// Os cabeçalhos das páginas da ficha. O resto do site não tem formulário nem dado pessoal; aqui tem.
// Só roda script com o nonce do pedido; serviço de fora novo (imagem, conexão, iframe) entra na diretiva
// certa, senão o navegador bloqueia em silêncio.

export function politicaDaFicha(nonce: string, urlSupabase: string, desenvolvimento: boolean, hashes: string[] = []): string {
  const supabase = urlSupabase ? new URL(urlSupabase).origin : ''
  const diretivas: [string, string[]][] = [
    ['default-src', ["'self'"]],
    ['script-src', ["'self'", `'nonce-${nonce}'`, ...hashes, "'strict-dynamic'", 'https://challenges.cloudflare.com', ...(desenvolvimento ? ["'unsafe-eval'"] : [])]],
    ['style-src', ["'self'", "'unsafe-inline'"]],
    ['img-src', ["'self'", 'data:', 'blob:', supabase].filter(Boolean)],
    ['font-src', ["'self'"]],
    ['connect-src', ["'self'", supabase, 'https://viacep.com.br', 'https://challenges.cloudflare.com', ...(desenvolvimento ? ['ws:'] : [])].filter(Boolean)],
    ['frame-src', ['https://challenges.cloudflare.com']],
    ['worker-src', ["'self'", 'blob:']],
    ['object-src', ["'none'"]],
    ['base-uri', ["'self'"]],
    ['form-action', ["'self'"]],
    ['frame-ancestors', ["'none'"]],
  ]
  return [...diretivas.map(([d, v]) => `${d} ${v.join(' ')}`), ...(desenvolvimento ? [] : ['upgrade-insecure-requests'])].join('; ')
}

export const CABECALHOS_DA_FICHA: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(self), microphone=(), geolocation=(), payment=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'no-store',
}

/** O hash de cada script embutido do layout (lib/scripts-iniciais.ts), no formato da CSP. */
export async function hashesDosScripts(scripts: string[]): Promise<string[]> {
  return Promise.all(
    scripts.map(async (s) => {
      const h = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))
      let bin = ''
      for (const b of h) bin += String.fromCharCode(b)
      return `'sha256-${btoa(bin)}'`
    }),
  )
}
