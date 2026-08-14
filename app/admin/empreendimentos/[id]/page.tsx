import Link from 'next/link'
import { notFound } from 'next/navigation'
import { criarClienteServidor } from '@/lib/supabase/server'
import { FormEmpreendimento } from '@/components/admin/FormEmpreendimento'
import { UploadImagens } from '@/components/admin/UploadImagens'
import { EditorUnidades } from '@/components/admin/EditorUnidades'
import type { Empreendimento, Imagem, Unidade } from '@/lib/tipos'
import estilos from './page.module.css'

export const dynamic = 'force-dynamic'

export default async function Editar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (id === 'novo') {
    return (
      <main className={estilos.pagina}>
        <Link href="/admin/empreendimentos" className={estilos.voltar}>
          ← Empreendimentos
        </Link>
        <h1 className={estilos.titulo}>Novo empreendimento</h1>
        <p className={estilos.dica}>
          Salve primeiro para poder enviar fotos e cadastrar as unidades.
        </p>
        <FormEmpreendimento inicial={{ cidade: 'São Luís', uf: 'MA', localizacao_aproximada: true }} />
      </main>
    )
  }

  const supabase = await criarClienteServidor()
  const { data } = await supabase
    .from('empreendimentos')
    .select('*, unidades(*), imagens(*)')
    .eq('id', id)
    .maybeSingle()

  if (!data) notFound()

  const e = data as Empreendimento & { unidades: Unidade[]; imagens: Imagem[] }
  const unidadesAtivas = e.unidades.filter(
    (u) => (u as Unidade & { arquivado_em?: string | null }).arquivado_em == null,
  )

  return (
    <main className={estilos.pagina}>
      <Link href="/admin/empreendimentos" className={estilos.voltar}>
        ← Empreendimentos
      </Link>
      <h1 className={estilos.titulo}>{e.nome}</h1>

      <FormEmpreendimento inicial={e} />

      <h2 className={estilos.secao}>Fotos</h2>
      <UploadImagens empreendimentoId={e.id} slug={e.slug} iniciais={e.imagens} />

      <h2 className={estilos.secao}>Unidades</h2>
      <EditorUnidades empreendimentoId={e.id} slug={e.slug} iniciais={unidadesAtivas} />
    </main>
  )
}
