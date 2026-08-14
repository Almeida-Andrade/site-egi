export interface ItemNavegacao {
  href: string
  rotulo: string
}

/** Itens do menu principal, compartilhados entre o cabeçalho e o menu mobile. */
export const ITENS_NAVEGACAO: ItemNavegacao[] = [
  { href: '/empreendimentos', rotulo: 'Empreendimentos' },
  { href: '/empreendimentos?disponiveis=1', rotulo: 'Disponíveis' },
  { href: '/sobre', rotulo: 'A EGI' },
  { href: '/contato', rotulo: 'Contato' },
]

/**
 * Qual item representa a rota atual, decidido só pelo caminho.
 *
 * A query fica de fora de propósito. Ler `useSearchParams` num componente de
 * cliente obriga o Next a envolvê-lo em `Suspense`, e numa página estática isso
 * faz o menu inteiro aparecer depois da hidratação — ou seja, piscar a cada
 * carregamento. Um destaque piscando é pior que "Disponíveis" nunca acender
 * sozinho, até porque ele é um filtro da listagem, não uma página à parte.
 *
 * A ficha de um imóvel acende "Empreendimentos".
 */
export function itemAtivo(caminho: string): string | null {
  if (caminho === '/empreendimentos' || caminho.startsWith('/empreendimentos/')) {
    return '/empreendimentos'
  }

  const item = ITENS_NAVEGACAO.find((i) => i.href === caminho)
  return item?.href ?? null
}
