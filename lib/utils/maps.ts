const HOSTS_PERMITIDOS = ['www.google.com', 'google.com', 'maps.google.com']

export function extrairUrlMaps(entrada: string): string | null {
  const texto = entrada.trim()
  if (!texto) return null

  // Captura até a MESMA aspa que abriu: a URL do Google carrega apóstrofo
  // ("Ville D'or"), e parar em qualquer aspa cortava o endereço no meio.
  const doIframe = texto.match(/<iframe\s[^>]*src=(["'])(.*?)\1/i)
  const bruta = doIframe ? doIframe[2] : texto

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
