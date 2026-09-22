export type StatusUnidade = 'disponivel' | 'ocupado' | 'reservado' | 'manutencao'

export type TipoEmpreendimento =
  | 'centro_comercial' | 'galpao' | 'residencial' | 'casa'
  | 'sala_avulsa' | 'apartamento' | 'misto' | 'terreno'

export type TipoUnidade =
  | 'loja' | 'sala' | 'mezanino' | 'cobertura' | 'galpao'
  | 'apartamento' | 'casa' | 'vaga' | 'container' | 'area' | 'terreno'

/** Para que serve o imóvel: locação é o portfólio; venda é a vitrine (/a-venda). */
export type Finalidade = 'locacao' | 'venda'

/** A galeria mostra só `foto`; planta e logo têm lugar próprio na vitrine. */
export type TipoImagem = 'foto' | 'planta' | 'logo'

export type SituacaoVenda = 'a_venda' | 'reservada' | 'vendida'

export interface Imagem {
  id: string
  storage_path: string
  /** URL pública completa (vem pronta do banco do CRM) */
  url: string
  alt: string | null
  capa: boolean
  ordem: number
  tipo: TipoImagem
}

export interface Unidade {
  id: string
  empreendimento_id: string
  identificacao: string
  tipo: TipoUnidade
  area_m2: number | null
  piso: string | null
  status: StatusUnidade
  disponivel_em: string | null
  descricao: string | null
  caracteristicas: string[]
  ordem: number
}

export interface Empreendimento {
  id: string
  slug: string
  nome: string
  descricao: string | null
  tipo: TipoEmpreendimento
  built_to_suit: boolean
  endereco: string | null
  bairro: string | null
  cidade: string
  uf: string
  cep: string | null
  localizacao_aproximada: boolean
  maps_embed_url: string | null
  maps_link: string | null
  publicado: boolean
  destaque: boolean
  ordem: number
  finalidade: Finalidade
  /** Vídeo do imóvel no bucket do CRM (um por imóvel), ou nulo */
  video_url: string | null
}

/**
 * Situação de uma unidade à venda — vem da view pública v_site_vendas. O
 * valor NÃO chega ao site: a vitrine diz "a consultar" e leva ao WhatsApp.
 */
export interface VendaUnidade {
  unidade_id: string
  situacao: SituacaoVenda
}

export interface UnidadeAVenda extends Unidade {
  venda: VendaUnidade | null
}

export interface ImovelAVenda extends Empreendimento {
  unidades: UnidadeAVenda[]
  fotos: Imagem[]
  capa: Imagem | null
  planta: Imagem | null
  logo: Imagem | null
  aVenda: number
  reservadas: number
  vendidas: number
}

export interface EmpreendimentoResumo extends Empreendimento {
  capa: Imagem | null
  total_unidades: number
  disponiveis: number
}

export interface EmpreendimentoComUnidades extends Empreendimento {
  unidades: Unidade[]
  imagens: Imagem[]
}

export interface FiltrosEmpreendimento {
  tipo?: TipoEmpreendimento
  cidade?: string
  apenasDisponiveis?: boolean
  busca?: string
  finalidade?: Finalidade
}

export interface Estatisticas {
  empreendimentos: number
  unidades: number
  disponiveis: number
  ocupacao: number
}

export interface EmpreendimentoAdmin extends Empreendimento {
  arquivado_em: string | null
}

export interface UnidadeAdmin extends Unidade {
  arquivado_em: string | null
}
