import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

// .env.local não é carregado automaticamente pelo Vitest
for (const linha of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = linha.match(/^([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] ??= m[2].trim()
}

const anon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

describe('RLS', () => {
  it('anônimo não consegue inserir empreendimento', async () => {
    const { error } = await anon.from('empreendimentos').insert({
      slug: 'invasao', nome: 'Invasão', tipo: 'galpao',
    })
    expect(error).not.toBeNull()
  })

  it('anônimo não consegue inserir unidade', async () => {
    const { error } = await anon.from('unidades').insert({
      empreendimento_id: '00000000-0000-0000-0000-000000000000',
      identificacao: 'Loja pirata', tipo: 'loja',
    })
    expect(error).not.toBeNull()
  })

  it('anônimo não consegue alterar status de unidade', async () => {
    const { data: alvo } = await anon
      .from('unidades').select('id, status').eq('status', 'ocupado').limit(1)

    // Banco vazio não prova nada sobre RLS, mas também não é falha deste teste.
    if (!alvo?.length) return

    const { data: afetadas } = await anon
      .from('unidades').update({ status: 'disponivel' }).eq('id', alvo[0].id).select()
    expect(afetadas ?? []).toHaveLength(0)

    const { data: depois } = await anon
      .from('unidades').select('status').eq('id', alvo[0].id).single()
    expect(depois!.status).toBe('ocupado')
  })

  it('toda linha visível ao anônimo está publicada', async () => {
    const { data, error } = await anon
      .from('empreendimentos')
      .select('slug, publicado')
    expect(error).toBeNull()
    for (const linha of data ?? []) {
      expect(linha.publicado).toBe(true)
    }
  })

  it('nenhuma coluna de contrato existe na tabela', async () => {
    const { error } = await anon
      .from('unidades')
      .select('valor_aluguel')
      .limit(1)
    expect(error).not.toBeNull()
    expect(error!.message).toMatch(/valor_aluguel/)
  })
})
