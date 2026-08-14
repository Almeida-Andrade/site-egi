const HOSTS_PERMITIDOS = ['www.google.com', 'google.com', 'maps.google.com']

/**
 * Aceita tanto a URL de embed quanto o <iframe> inteiro copiado do Google Maps.
 * Retorna null para qualquer coisa que não seja um embed do Google.
 */
export function extrairUrlMaps(entrada: string): string | null {
  const texto = entrada.trim()
  if (!texto) return null

  const doIframe = texto.match(/<iframe\s[^>]*src=["']([^"']+)["']/i)
  const bruta = doIframe ? doIframe[1] : texto

  let url: URL
  try {
    url = new URL(bruta)
  } catch {
    return null
  }

  if (url.protocol !== 'https:') return null
  if (url.username || url.password) return null
  if (!HOSTS_PERMITIDOS.includes(url.hostname)) return null
  if (url.pathname !== '/maps/embed') return null

  return url.toString()
}

/**
 * Link de busca no Google Maps montado a partir do endereço. Serve de "como
 * chegar" enquanto o empreendimento não tem um maps_link próprio salvo pelo
 * painel. Devolve null quando o endereço é aproximado ou não existe — nesse
 * caso a busca cairia no centro do bairro e passaria precisão que não temos.
 */
export function linkBuscaMaps(dados: {
  endereco: string | null
  bairro: string | null
  cidade: string
  uf: string
  localizacao_aproximada: boolean
}): string | null {
  if (dados.localizacao_aproximada) return null
  if (!dados.endereco) return null

  const consulta = [dados.endereco, dados.bairro, dados.cidade, dados.uf, 'Brasil']
    .filter(Boolean)
    .join(', ')

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`
}
