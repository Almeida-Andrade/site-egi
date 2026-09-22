import { criarClientePublico } from '@/lib/supabase/publico'
import type {
  Empreendimento, EmpreendimentoComUnidades, EmpreendimentoResumo,
  Estatisticas, FiltrosEmpreendimento, Imagem, Unidade,
} from '@/lib/tipos'
import { capaDe } from '@/lib/imagens'
import { ordenarUnidades } from './ordenacao'
import { CAMPOS, CAMPOS_UNIDADES, REL_IMAGENS } from './campos'

type LinhaComRelacoes = Empreendimento & {
  unidades: Unidade[]
  imagens: Imagem[]
}

function resumir(linha: LinhaComRelacoes): EmpreendimentoResumo {
  return {
    ...linha,
    capa: capaDe(linha.imagens),
    total_unidades: linha.unidades.length,
    disponiveis: linha.unidades.filter((u) => u.status === 'disponivel').length,
  }
}

export async function listarEmpreendimentos(
  filtros: FiltrosEmpreendimento = {},
): Promise<EmpreendimentoResumo[]> {
  const supabase = criarClientePublico()

  let consulta = supabase
    .from('empreendimentos')
    .select(`${CAMPOS}, unidades(${CAMPOS_UNIDADES}), ${REL_IMAGENS}`)
    .order('ordem', { ascending: true })
    .order('nome', { ascending: true })

  if (filtros.tipo) consulta = consulta.eq('tipo', filtros.tipo)
  if (filtros.cidade) consulta = consulta.eq('cidade', filtros.cidade)
  if (filtros.busca) consulta = consulta.ilike('nome', `%${filtros.busca}%`)
  if (filtros.finalidade) consulta = consulta.eq('finalidade', filtros.finalidade)

  const { data, error } = await consulta
  if (error) throw new Error(`Falha ao listar empreendimentos: ${error.message}`)

  const resumos = (data as LinhaComRelacoes[]).map(resumir)
  return filtros.apenasDisponiveis
    ? resumos.filter((e) => e.disponiveis > 0)
    : resumos
}

export async function listarBuiltToSuit(): Promise<EmpreendimentoResumo[]> {
  const supabase = criarClientePublico()
  const { data, error } = await supabase
    .from('empreendimentos')
    .select(`${CAMPOS}, unidades(${CAMPOS_UNIDADES}), ${REL_IMAGENS}`)
    .eq('built_to_suit', true)
    .order('ordem', { ascending: true })

  if (error) throw new Error(`Falha ao listar built to suit: ${error.message}`)
  return (data as LinhaComRelacoes[]).map(resumir)
}

export async function obterEmpreendimentoPorSlug(
  slug: string,
): Promise<EmpreendimentoComUnidades | null> {
  const supabase = criarClientePublico()
  const { data, error } = await supabase
    .from('empreendimentos')
    .select(`${CAMPOS}, unidades(${CAMPOS_UNIDADES}), ${REL_IMAGENS}`)
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw new Error(`Falha ao buscar ${slug}: ${error.message}`)
  if (!data) return null

  const linha = data as LinhaComRelacoes
  return {
    ...linha,
    unidades: ordenarUnidades(linha.unidades),
    imagens: [...linha.imagens].sort((a, b) => Number(b.capa) - Number(a.capa) || a.ordem - b.ordem),
  }
}

export async function listarSlugsPublicados(): Promise<string[]> {
  const supabase = criarClientePublico()
  const { data, error } = await supabase.from('empreendimentos').select('slug')
  if (error) throw new Error(`Falha ao listar slugs: ${error.message}`)
  return (data ?? []).map((l) => l.slug as string)
}

export async function listarRotasPublicadas(): Promise<
  { slug: string; atualizadoEm: string }[]
> {
  const supabase = criarClientePublico()
  const { data, error } = await supabase.from('empreendimentos').select('slug, updated_at')
  if (error) throw new Error(`Falha ao listar rotas: ${error.message}`)
  return (data ?? []).map((l) => ({
    slug: l.slug as string,
    atualizadoEm: l.updated_at as string,
  }))
}

export async function listarCidades(): Promise<string[]> {
  const supabase = criarClientePublico()
  const { data, error } = await supabase.from('empreendimentos').select('cidade')
  if (error) throw new Error(`Falha ao listar cidades: ${error.message}`)
  return [...new Set((data ?? []).map((l) => l.cidade as string))].sort()
}

/**
 * Os números da home são do PORTFÓLIO DE LOCAÇÃO: imóvel à venda tem as casas
 * como "disponível" no banco e, contado aqui, viraria "unidades disponíveis
 * para alugar" no hero. A vitrine tem os números dela.
 */
export async function obterEstatisticas(): Promise<Estatisticas> {
  const supabase = criarClientePublico()

  const [{ count: empreendimentos, error: erroContagem }, { data: unidades, error: erroUnidades }] = await Promise.all([
    supabase
      .from('empreendimentos')
      .select('id', { count: 'exact', head: true })
      .eq('finalidade', 'locacao'),
    supabase
      .from('unidades')
      .select('status, empreendimentos!inner(finalidade)')
      .eq('empreendimentos.finalidade', 'locacao'),
  ])

  if (erroContagem) throw new Error(`Falha ao contar empreendimentos: ${erroContagem.message}`)
  if (erroUnidades) throw new Error(`Falha ao calcular estatísticas: ${erroUnidades.message}`)

  const total = unidades?.length ?? 0
  const disponiveis = (unidades ?? []).filter((u) => u.status === 'disponivel').length
  const ocupadas = total - disponiveis

  return {
    empreendimentos: empreendimentos ?? 0,
    unidades: total,
    disponiveis,
    ocupacao: total === 0 ? 0 : Math.round((ocupadas / total) * 100),
  }
}
