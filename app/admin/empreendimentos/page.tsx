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
  unidades: { status: string }[]
}

export default async function ListaAdmin() {
  const supabase = await criarClienteServidor()
  const { data, error } = await supabase
    .from('empreendimentos')
    .select('id, nome, slug, tipo, cidade, publicado, unidades(status)')
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
          {linhas.map((l) => (
            <tr key={l.id}>
              <td>
                <Link href={`/admin/empreendimentos/${l.id}`} className={estilos.link}>
                  {l.nome}
                </Link>
              </td>
              <td>{rotuloTipoEmpreendimento(l.tipo)}</td>
              <td>{l.cidade}</td>
              <td className={estilos.num}>{l.unidades.length}</td>
              <td className={estilos.num}>
                {l.unidades.filter((u) => u.status === 'disponivel').length}
              </td>
              <td>{l.publicado ? 'Publicado' : 'Rascunho'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
