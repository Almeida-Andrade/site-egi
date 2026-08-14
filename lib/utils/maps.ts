const HOSTS_PERMITIDOS = ['www.google.com', 'google.com', 'maps.google.com']

/**
 * Aceita tanto a URL de embed quanto o <iframe> inteiro copiado do Google Maps.
 * Retorna null para qualquer coisa que não seja um embed do Google.
 */
export function extrairUrlMaps(entrada: string): string | null {
  const texto = entrada.trim()
  if (!texto) return null

  const doIframe = texto.match(/src=["']([^"']+)["']/i)
  const bruta = doIframe ? doIframe[1] : texto

  let url: URL
  try {
    url = new URL(bruta)
  } catch {
    return null
  }

  if (url.protocol !== 'https:') return null
  if (!HOSTS_PERMITIDOS.includes(url.hostname)) return null
  if (!url.pathname.startsWith('/maps/embed')) return null

  return url.toString()
}
