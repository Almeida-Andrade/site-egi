import { criarClientePublico } from '@/lib/supabase/publico'
import type { Empreendimento, Imagem, ImovelAVenda, Unidade, VendaUnidade } from '@/lib/tipos'
import { montarImovelAVenda } from '@/lib/vendas'
import { CAMPOS, CAMPOS_UNIDADES, REL_IMAGENS } from './campos'

type Linha = Empreendimento & { unidades: Unidade[]; imagens: Imagem[] }

// O preço mora na view v_site_vendas, que a RLS do CRM já restringe a imóvel
// publicado à venda; aqui só se casa por unidade_id.
async function precosDe(unidadeIds: string[]): Promise<VendaUnidade[]> {
  if (unidadeIds.length === 0) return []
  const supabase = criarClientePublico()
  const { data, error } = await supabase
    .from('v_site_vendas')
    .select('unidade_id, valor_venda, situacao')
    .in('unidade_id', unidadeIds)
  if (error) throw new Error(`Falha ao buscar preços: ${error.message}`)
  return (data ?? []) as VendaUnidade[]
}

export async function listarImoveisAVenda(): Promise<ImovelAVenda[]> {
  const supabase = criarClientePublico()
  const { data, error } = await supabase
    .from('empreendimentos')
    .select(`${CAMPOS}, unidades(${CAMPOS_UNIDADES}), ${REL_IMAGENS}`)
    .eq('finalidade', 'venda')
    .order('ordem', { ascending: true })
    .order('nome', { ascending: true })
  if (error) throw new Error(`Falha ao listar imóveis à venda: ${error.message}`)

  const linhas = (data ?? []) as Linha[]
  const vendas = await precosDe(linhas.flatMap((l) => l.unidades.map((u) => u.id)))
  return linhas.map((l) => montarImovelAVenda(l, vendas))
}

export async function obterImovelAVendaPorSlug(slug: string): Promise<ImovelAVenda | null> {
  const supabase = criarClientePublico()
  const { data, error } = await supabase
    .from('empreendimentos')
    .select(`${CAMPOS}, unidades(${CAMPOS_UNIDADES}), ${REL_IMAGENS}`)
    .eq('finalidade', 'venda')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw new Error(`Falha ao buscar ${slug}: ${error.message}`)
  if (!data) return null

  const linha = data as Linha
  const vendas = await precosDe(linha.unidades.map((u) => u.id))
  return montarImovelAVenda(linha, vendas)
}
