'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarClienteNavegador } from '@/lib/supabase/client'
import { extrairUrlMaps } from '@/lib/utils/maps'
import { gerarSlug } from '@/lib/utils/slug'
import { revalidarSite } from '@/lib/dados/admin'
import { rotuloTipoEmpreendimento } from '@/lib/utils/rotulos'
import type { Empreendimento, TipoEmpreendimento } from '@/lib/tipos'
import estilos from './FormEmpreendimento.module.css'

const TIPOS: TipoEmpreendimento[] = [
  'centro_comercial',
  'galpao',
  'residencial',
  'casa',
  'sala_avulsa',
  'apartamento',
  'misto',
  'terreno',
]

export function FormEmpreendimento({ inicial }: { inicial: Partial<Empreendimento> }) {
  const router = useRouter()
  const [form, setForm] = useState<Partial<Empreendimento>>(inicial)
  const [mapaColado, setMapaColado] = useState(inicial.maps_embed_url ?? '')
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [arquivado, setArquivado] = useState(false)

  function alterar<C extends keyof Empreendimento>(campo: C, valor: Empreendimento[C]) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault()
    setSalvando(true)
    setErro(null)

    let mapsUrl: string | null = null
    if (mapaColado.trim()) {
      mapsUrl = extrairUrlMaps(mapaColado)
      if (!mapsUrl) {
        setErro(
          'O link do mapa não parece ser um embed do Google Maps. No Google Maps, use ' +
            'Compartilhar → Incorporar um mapa e cole o conteúdo aqui.',
        )
        setSalvando(false)
        return
      }
    }

    const supabase = criarClienteNavegador()
    const dados = {
      ...form,
      slug: form.slug || gerarSlug(form.nome ?? ''),
      maps_embed_url: mapsUrl,
    }

    const { data, error } = form.id
      ? await supabase.from('empreendimentos').update(dados).eq('id', form.id).select().single()
      : await supabase.from('empreendimentos').insert(dados).select().single()

    if (error) {
      setErro(error.message)
      setSalvando(false)
      return
    }

    await revalidarSite(data.slug)
    setSalvando(false)
    router.push(`/admin/empreendimentos/${data.id}`)
    router.refresh()
  }

  async function arquivar() {
    if (!form.id) return
    const supabase = criarClienteNavegador()
    const { error } = await supabase
      .from('empreendimentos')
      .update({ arquivado_em: new Date().toISOString(), publicado: false })
      .eq('id', form.id)

    if (error) {
      setErro(error.message)
      return
    }
    await revalidarSite(form.slug)
    setArquivado(true)
    setForm((atual) => ({ ...atual, publicado: false }))
  }

  async function desarquivar() {
    if (!form.id) return
    const supabase = criarClienteNavegador()
    const { error } = await supabase
      .from('empreendimentos')
      .update({ arquivado_em: null })
      .eq('id', form.id)

    if (error) {
      setErro(error.message)
      return
    }
    await revalidarSite(form.slug)
    setArquivado(false)
  }

  return (
    <form className={estilos.form} onSubmit={salvar}>
      <label className={estilos.campo}>
        <span>Nome</span>
        <input
          value={form.nome ?? ''}
          onChange={(e) => alterar('nome', e.target.value)}
          required
        />
      </label>

      <label className={estilos.campo}>
        <span>Tipo</span>
        <select
          value={form.tipo ?? 'centro_comercial'}
          onChange={(e) => alterar('tipo', e.target.value as TipoEmpreendimento)}
        >
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {rotuloTipoEmpreendimento(t)}
            </option>
          ))}
        </select>
      </label>

      <label className={estilos.campo}>
        <span>Descrição</span>
        <textarea
          rows={4}
          value={form.descricao ?? ''}
          onChange={(e) => alterar('descricao', e.target.value)}
        />
      </label>

      <div className={estilos.linha}>
        <label className={estilos.campo}>
          <span>Endereço</span>
          <input
            value={form.endereco ?? ''}
            onChange={(e) => alterar('endereco', e.target.value)}
          />
        </label>
        <label className={estilos.campo}>
          <span>Bairro</span>
          <input value={form.bairro ?? ''} onChange={(e) => alterar('bairro', e.target.value)} />
        </label>
        <label className={estilos.campo}>
          <span>Cidade</span>
          <input
            value={form.cidade ?? 'São Luís'}
            onChange={(e) => alterar('cidade', e.target.value)}
          />
        </label>
      </div>

      <label className={estilos.campo}>
        <span>Mapa — cole o link ou o código de incorporação do Google Maps</span>
        <textarea
          rows={3}
          value={mapaColado}
          onChange={(e) => setMapaColado(e.target.value)}
          placeholder='<iframe src="https://www.google.com/maps/embed?pb=..."></iframe>'
        />
      </label>

      <div className={estilos.chaves}>
        <label>
          <input
            type="checkbox"
            checked={form.localizacao_aproximada ?? false}
            onChange={(e) => alterar('localizacao_aproximada', e.target.checked)}
          />
          Localização aproximada (mostrar só bairro e cidade)
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.built_to_suit ?? false}
            onChange={(e) => alterar('built_to_suit', e.target.checked)}
          />
          Built to suit (aparece como case, fora da listagem)
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.destaque ?? false}
            onChange={(e) => alterar('destaque', e.target.checked)}
          />
          Destaque na home
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.publicado ?? false}
            onChange={(e) => alterar('publicado', e.target.checked)}
          />
          Publicado
        </label>
      </div>

      {erro && <p className={estilos.erro}>{erro}</p>}

      <div className={estilos.acoes}>
        <button className={estilos.salvar} type="submit" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar'}
        </button>

        {form.id && !arquivado && (
          <button type="button" className={estilos.arquivar} onClick={arquivar}>
            Arquivar empreendimento
          </button>
        )}
      </div>

      {arquivado && (
        <p className={estilos.desfazer}>
          Empreendimento arquivado e despublicado.{' '}
          <button type="button" onClick={desarquivar}>
            Desfazer
          </button>
        </p>
      )}
    </form>
  )
}
