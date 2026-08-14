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

const POR_TIPO: Record<string, string[]> = {
  centro_comercial: ['centro-comercial-1.jpg', 'centro-comercial-2.jpg', 'centro-comercial-3.jpg'],
  galpao: ['galpao-1.jpg', 'galpao-2.jpg'],
  residencial: ['residencial-1.jpg', 'residencial-2.jpg'],
  sala_avulsa: ['sala-comercial-1.jpg'],
  misto: ['centro-comercial-1.jpg'],
  casa: ['residencial-1.jpg'],
  apartamento: ['residencial-2.jpg'],
  terreno: ['galpao-1.jpg'],
}

async function main() {
  const { error: erroLogin } = await supabase.auth.signInWithPassword({
    email: process.env.ADMIN_EMAIL!,
    password: process.env.ADMIN_PASSWORD!,
  })
  if (erroLogin) throw new Error(`Login falhou: ${erroLogin.message}`)

  const { data: empreendimentos, error } = await supabase
    .from('empreendimentos')
    .select('id, slug, tipo')
  if (error) throw error

  for (const emp of empreendimentos!) {
    const arquivos = POR_TIPO[emp.tipo] ?? POR_TIPO.centro_comercial
    for (const [i, arquivo] of arquivos.entries()) {
      const conteudo = readFileSync(join('seed/fotos', arquivo))
      const caminho = `empreendimentos/${emp.id}/${arquivo}`

      const { error: erroUpload } = await supabase.storage
        .from('imoveis')
        .upload(caminho, conteudo, { contentType: 'image/jpeg', upsert: true })
      if (erroUpload) throw new Error(`${emp.slug}: ${erroUpload.message}`)

      const { data: existente, error: erroConsulta } = await supabase
        .from('imagens')
        .select('id')
        .eq('empreendimento_id', emp.id)
        .eq('storage_path', caminho)
        .maybeSingle()
      if (erroConsulta) throw new Error(`${emp.slug}: ${erroConsulta.message}`)

      if (existente) {
        const { error: erroImagem } = await supabase
          .from('imagens')
          .update({ alt: `Fachada — ${emp.slug}`, capa: i === 0, ordem: i })
          .eq('id', existente.id)
        if (erroImagem) throw new Error(`${emp.slug}: ${erroImagem.message}`)
      } else {
        const { error: erroImagem } = await supabase.from('imagens').insert({
          empreendimento_id: emp.id,
          storage_path: caminho,
          alt: `Fachada — ${emp.slug}`,
          capa: i === 0,
          ordem: i,
        })
        if (erroImagem) throw new Error(`${emp.slug}: ${erroImagem.message}`)
      }
    }
    console.log(`ok ${emp.slug}`)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
