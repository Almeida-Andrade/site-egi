import type { StatusUnidade, TipoUnidade, TipoEmpreendimento } from '@/lib/tipos'

const UNIDADE: Record<TipoUnidade, string> = {
  loja: 'Loja', sala: 'Sala', mezanino: 'Mezanino', cobertura: 'Cobertura',
  galpao: 'Galpão', apartamento: 'Apartamento', casa: 'Casa', vaga: 'Vaga',
  container: 'Container', area: 'Área', terreno: 'Terreno',
}

const EMPREENDIMENTO: Record<TipoEmpreendimento, string> = {
  centro_comercial: 'Centro comercial', galpao: 'Galpão',
  residencial: 'Residencial', casa: 'Casa', sala_avulsa: 'Sala comercial',
  apartamento: 'Apartamento', misto: 'Misto', terreno: 'Terreno',
}

const STATUS: Record<StatusUnidade, string> = {
  disponivel: 'Disponível', ocupado: 'Ocupado',
  reservado: 'Reservado', manutencao: 'Em manutenção',
}

export const rotuloTipoUnidade = (t: TipoUnidade) => UNIDADE[t]
export const rotuloTipoEmpreendimento = (t: TipoEmpreendimento) => EMPREENDIMENTO[t]
export const rotuloStatus = (s: StatusUnidade) => STATUS[s]

export function urlImagem(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${base}/storage/v1/object/public/imoveis/${storagePath}`
}
