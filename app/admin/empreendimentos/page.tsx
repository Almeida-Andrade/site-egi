import Link from 'next/link'
import { criarClienteServidor } from '@/lib/supabase/server'
import { rotuloTipoEmpreendimento } from '@/lib/utils/rotulos'
import type { TipoEmpreendimento } from '@/lib/tipos'
import estilos from './page.module.css'

export const dynamic = 'force-dynamic'

type LinhaAdmin = {
  id: string
  nome: string
  slug: string
  tipo: TipoEmpreendimento
  cidade: string
  publicado: boolean
  unidades: { status: string; arquivado_em: string | null }[]
}

export default async function ListaAdmin() {
  const supabase = await criarClienteServidor()
  const { data, error } = await supabase
    .from('empreendimentos')
    .select('id, nome, slug, tipo, cidade, publicado, unidades(status, arquivado_em)')
    .is('arquivado_em', null)
    .order('ordem')

  if (error) throw new Error(`Falha ao carregar empreendimentos: ${error.message}`)

  const linhas = (data ?? []) as LinhaAdmin[]

  return (
    <main className={estilos.pagina}>
      <div className={estilos.topo}>
        <h1 className={estilos.titulo}>Empreendimentos</h1>
        <Link href="/admin/empreendimentos/novo" className={estilos.novo}>
          + Novo empreendimento
        </Link>
      </div>

      <table className={estilos.tabela}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Cidade</th>
            <th>Unidades</th>
            <th>Livres</th>
            <th>Situação</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => {
            // Unidade arquivada não conta: o painel mostraria mais unidades do
            // que o site, e o operador passaria a informação errada.
            const ativas = l.unidades.filter((u) => u.arquivado_em == null)
            return (
              <tr key={l.id}>
                <td>
                  <Link href={`/admin/empreendimentos/${l.id}`} className={estilos.link}>
                    {l.nome}
                  </Link>
                </td>
                <td>{rotuloTipoEmpreendimento(l.tipo)}</td>
                <td>{l.cidade}</td>
                <td className={estilos.num}>{ativas.length}</td>
                <td className={estilos.num}>
                  {ativas.filter((u) => u.status === 'disponivel').length}
                </td>
                <td>{l.publicado ? 'Publicado' : 'Rascunho'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </main>
  )
}
