import type {
  Empreendimento, Imagem, ImovelAVenda, SituacaoVenda, Unidade, UnidadeAVenda, VendaUnidade,
} from '@/lib/tipos'
import { capaDe, fotosDe, pecaDe } from './imagens'
import { ordenarUnidades } from './dados/ordenacao'

// Regras puras da vitrine à venda. A situação vem da view v_site_vendas, que
// só devolve unidade de imóvel publicado à venda; o valor não vem — o site
// diz "a consultar" e leva ao WhatsApp (decisão do dono, 22/09/2026).

export function lerSituacao(v: unknown): SituacaoVenda {
  return v === 'reservada' || v === 'vendida' ? v : 'a_venda'
}

/**
 * Junta o imóvel, as unidades e as situações num objeto só, já com as
 * imagens separadas por tipo. `vendas` pode trazer linhas de outros imóveis:
 * casa por `unidade_id`; unidade sem linha conta como à venda.
 */
export function montarImovelAVenda(
  linha: Empreendimento & { unidades: Unidade[]; imagens: Imagem[] },
  vendas: VendaUnidade[],
): ImovelAVenda {
  const vendaDa = new Map(vendas.map((v) => [v.unidade_id, v]))
  const unidades: UnidadeAVenda[] = ordenarUnidades(linha.unidades).map((u) => {
    const v = vendaDa.get(u.id)
    return { ...u, venda: v ? { ...v, situacao: lerSituacao(v.situacao) } : null }
  })
  const { unidades: _u, imagens, ...imovel } = linha
  void _u
  const conta = (s: SituacaoVenda) => unidades.filter((u) => situacaoDe(u) === s).length
  return {
    ...imovel,
    unidades,
    fotos: fotosDe(imagens),
    capa: capaDe(imagens),
    planta: pecaDe(imagens, 'planta'),
    logo: pecaDe(imagens, 'logo'),
    aVenda: conta('a_venda'),
    reservadas: conta('reservada'),
    vendidas: conta('vendida'),
  }
}

export function situacaoDe(u: UnidadeAVenda): SituacaoVenda {
  return u.venda?.situacao ?? 'a_venda'
}

/** "132,75 m²" — vírgula decimal, sem zeros à toa. */
export function formatarArea(m2: number): string {
  return `${m2.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} m²`
}

const SITUACAO: Record<SituacaoVenda, string> = {
  a_venda: 'À venda',
  reservada: 'Reservada',
  vendida: 'Vendida',
}

export const rotuloSituacaoVenda = (s: SituacaoVenda) => SITUACAO[s]

/**
 * A orientação solar vem nas características da unidade ("Poente (sol da
 * tarde)"). É o dado que mais pesa na escolha de uma casa, então ganha lugar
 * próprio no cartão em vez de ficar perdido na lista.
 */
export function orientacaoSolar(caracteristicas: string[]): string | null {
  const achada = caracteristicas.find((c) => /nascente|poente/i.test(c))
  return achada ?? null
}
