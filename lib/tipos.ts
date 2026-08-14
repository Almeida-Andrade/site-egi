export type StatusUnidade = 'disponivel' | 'ocupado' | 'reservado' | 'manutencao'

export type TipoEmpreendimento =
  | 'centro_comercial' | 'galpao' | 'residencial' | 'casa'
  | 'sala_avulsa' | 'apartamento' | 'misto' | 'terreno'

export type TipoUnidade =
  | 'loja' | 'sala' | 'mezanino' | 'cobertura' | 'galpao'
  | 'apartamento' | 'casa' | 'vaga' | 'container' | 'area' | 'terreno'

export interface Imagem {
  id: string
  storage_path: string
  alt: string | null
  capa: boolean
  ordem: number
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
}

export interface Estatisticas {
  empreendimentos: number
  unidades: number
  disponiveis: number
  ocupacao: number // percentual inteiro, 0 a 100
}
