export interface ItemNavegacao {
  href: string
  rotulo: string
}

export const ITENS_NAVEGACAO: ItemNavegacao[] = [
  { href: '/', rotulo: 'Início' },
  { href: '/empreendimentos', rotulo: 'Empreendimentos' },
  { href: '/sobre', rotulo: 'A EGI' },
  { href: '/contato', rotulo: 'Contato' },
]

export function itemAtivo(caminho: string): string | null {
  if (caminho === '/empreendimentos' || caminho.startsWith('/empreendimentos/')) {
    return '/empreendimentos'
  }

  const item = ITENS_NAVEGACAO.find((i) => i.href === caminho)
  return item?.href ?? null
}
