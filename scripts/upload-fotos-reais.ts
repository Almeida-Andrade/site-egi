/**
 * Sobe as fotos reais do portfólio (seed/fotos-reais) para o Storage e liga
 * cada uma ao seu empreendimento, removendo os placeholders do Unsplash.
 *
 * Idempotente: rodar de novo sobrescreve os mesmos caminhos e reaproveita as
 * linhas já existentes em `imagens`.
 *
 * Uso: npx tsx scripts/upload-fotos-reais.ts
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

for (const linha of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = linha.match(/^([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] ??= m[2].trim()
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

const PASTA = 'seed/fotos-reais'

/** Nomes gerados por upload-fotos-seed.ts. Só estes são removidos — uma foto
 *  enviada pelo painel nunca casa com a lista e por isso é preservada. */
const PLACEHOLDERS = [
  'centro-comercial-1.jpg',
  'centro-comercial-2.jpg',
  'centro-comercial-3.jpg',
  'galpao-1.jpg',
  'galpao-2.jpg',
  'residencial-1.jpg',
  'residencial-2.jpg',
  'sala-comercial-1.jpg',
]

interface ItemManifesto {
  slug: string
  arquivo: string
  alt: string
  ordem: number
  capa: boolean
}

async function main() {
  const { error: erroLogin } = await supabase.auth.signInWithPassword({
    email: process.env.ADMIN_EMAIL!,
    password: process.env.ADMIN_PASSWORD!,
  })
  if (erroLogin) throw new Error(`Login falhou: ${erroLogin.message}`)

  const manifesto: ItemManifesto[] = JSON.parse(
    readFileSync(join(PASTA, 'manifesto.json'), 'utf8'),
  )

  const { data: empreendimentos, error } = await supabase
    .from('empreendimentos')
    .select('id, slug')
  if (error) throw error

  const porSlug = new Map(empreendimentos!.map((e) => [e.slug, e.id]))

  const semRegistro = [...new Set(manifesto.map((i) => i.slug))].filter((s) => !porSlug.has(s))

  const porEmpreendimento = new Map<string, ItemManifesto[]>()
  for (const item of manifesto) {
    if (!porSlug.has(item.slug)) continue
    const lista = porEmpreendimento.get(item.slug) ?? []
    lista.push(item)
    porEmpreendimento.set(item.slug, lista)
  }

  for (const [slug, itens] of porEmpreendimento) {
    const empreendimentoId = porSlug.get(slug)!

    // 1. Sobe os arquivos
    for (const item of itens) {
      const caminho = `empreendimentos/${empreendimentoId}/${item.arquivo}`
      const { error: erroUpload } = await supabase.storage
        .from('imoveis')
        .upload(caminho, readFileSync(join(PASTA, item.arquivo)), {
          contentType: 'image/jpeg',
          upsert: true,
        })
      if (erroUpload) throw new Error(`${slug} (upload): ${erroUpload.message}`)
    }

    // 2. Registra as linhas novas antes de mexer nas antigas, para que o
    //    empreendimento nunca fique sem capa se algo falhar no meio.
    for (const item of itens) {
      const caminho = `empreendimentos/${empreendimentoId}/${item.arquivo}`

      const { data: existente, error: erroConsulta } = await supabase
        .from('imagens')
        .select('id')
        .eq('empreendimento_id', empreendimentoId)
        .eq('storage_path', caminho)
        .maybeSingle()
      if (erroConsulta) throw new Error(`${slug} (consulta): ${erroConsulta.message}`)

      const campos = { alt: item.alt, capa: item.capa, ordem: item.ordem }
      const { error: erroLinha } = existente
        ? await supabase.from('imagens').update(campos).eq('id', existente.id)
        : await supabase
            .from('imagens')
            .insert({ empreendimento_id: empreendimentoId, storage_path: caminho, ...campos })
      if (erroLinha) throw new Error(`${slug} (imagens): ${erroLinha.message}`)
    }

    // 3. Remove os placeholders deste empreendimento
    const antigos = PLACEHOLDERS.map((n) => `empreendimentos/${empreendimentoId}/${n}`)

    const { error: erroApaga } = await supabase
      .from('imagens')
      .delete()
      .eq('empreendimento_id', empreendimentoId)
      .in('storage_path', antigos)
    if (erroApaga) throw new Error(`${slug} (limpeza): ${erroApaga.message}`)

    const { error: erroStorage } = await supabase.storage.from('imoveis').remove(antigos)
    if (erroStorage) throw new Error(`${slug} (storage): ${erroStorage.message}`)

    console.log(`ok ${slug} — ${itens.length} foto(s)`)
  }

  if (semRegistro.length) {
    console.log(`\nSem empreendimento cadastrado (fotos ficaram de fora): ${semRegistro.join(', ')}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
