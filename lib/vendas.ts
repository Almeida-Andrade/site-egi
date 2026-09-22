import type {
  Empreendimento, Imagem, ImovelAVenda, SituacaoVenda, Unidade, UnidadeAVenda, VendaUnidade,
} from '@/lib/tipos'
import { capaDe, fotosDe, pecaDe } from './imagens'
import { ordenarUnidades } from './dados/ordenacao'

// Regras puras da vitrine à venda. O preço vem da view v_site_vendas, que só
// devolve unidade de imóvel publicado à venda — unidade sem linha lá é
// unidade sem preço, e a tela diz "sob consulta" em vez de inventar número.

export function lerSituacao(v: unknown): SituacaoVenda {
  return v === 'reservada' || v === 'vendida' ? v : 'a_venda'
}

/**
 * Junta o imóvel, as unidades e os preços num objeto só, já com as imagens
 * separadas por tipo. `vendas` pode trazer linhas de outros imóveis: casa por
 * `unidade_id`.
 */
export function montarImovelAVenda(
  linha: Empreendimento & { unidades: Unidade[]; imagens: Imagem[] },
  vendas: VendaUnidade[],
): ImovelAVenda {
  const vendaDa = new Map(vendas.map((v) => [v.unidade_id, v]))
  const unidades: UnidadeAVenda[] = ordenarUnidades(linha.unidades).map((u) => {
    const v = vendaDa.get(u.id)
    return {
      ...u,
      venda: v ? { ...v, valor_venda: Number(v.valor_venda), situacao: lerSituacao(v.situacao) } : null,
    }
  })
  const { unidades: _u, imagens, ...imovel } = linha
  void _u
  const conta = (s: SituacaoVenda) => unidades.filter((u) => u.venda?.situacao === s).length
  return {
    ...imovel,
    unidades,
    fotos: fotosDe(imagens),
    capa: capaDe(imagens),
    planta: pecaDe(imagens, 'planta'),
    logo: pecaDe(imagens, 'logo'),
    menorPreco: menorPreco(unidades),
    aVenda: conta('a_venda'),
    reservadas: conta('reservada'),
    vendidas: conta('vendida'),
  }
}

/** Menor preço entre as unidades ainda à venda (reservada e vendida ficam fora). */
export function menorPreco(unidades: UnidadeAVenda[]): number | null {
  const precos = unidades
    .filter((u) => u.venda?.situacao === 'a_venda')
    .map((u) => u.venda!.valor_venda)
  return precos.length ? Math.min(...precos) : null
}

/** "R$ 1.408.734,80" — sempre com centavos, como na tabela de vendas. */
export function formatarPreco(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** "R$ 1,41 mi" para o cartão da listagem; abaixo de um milhão, "R$ 850 mil". */
export function precoCurto(valor: number): string {
  if (valor >= 1_000_000) {
    return `R$ ${(valor / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} mi`
  }
  if (valor >= 1_000) return `R$ ${Math.round(valor / 1_000).toLocaleString('pt-BR')} mil`
  return formatarPreco(valor)
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
