'use client'

import { useState } from 'react'
import { criarClienteNavegador } from '@/lib/supabase/client'
import { revalidarSite } from '@/lib/dados/admin'
import type { StatusUnidade, TipoUnidade, Unidade, UnidadeAdmin } from '@/lib/tipos'
import { rotuloStatus, rotuloTipoUnidade } from '@/lib/utils/rotulos'
import { ordenarUnidades } from '@/lib/dados/ordenacao'
import estilos from './EditorUnidades.module.css'

const STATUS: StatusUnidade[] = ['disponivel', 'ocupado', 'reservado', 'manutencao']
const TIPOS: TipoUnidade[] = [
  'loja',
  'sala',
  'mezanino',
  'cobertura',
  'galpao',
  'apartamento',
  'casa',
  'vaga',
  'container',
  'area',
  'terreno',
]

export function EditorUnidades({
  empreendimentoId,
  slug,
  iniciais,
  arquivadasIniciais,
}: {
  empreendimentoId: string
  slug: string
  iniciais: Unidade[]
  arquivadasIniciais: UnidadeAdmin[]
}) {
  const [unidades, setUnidades] = useState(ordenarUnidades(iniciais))
  const [arquivadas, setArquivadas] = useState(arquivadasIniciais)
  const [nova, setNova] = useState({ identificacao: '', tipo: 'loja' as TipoUnidade })
  const [salvandoId, setSalvandoId] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  async function revalidar() {
    try {
      await revalidarSite(slug)
    } catch {
      setAviso('Alteração salva, mas o site público pode levar até um minuto para refletir.')
    }
  }

  async function trocarStatus(unidade: Unidade, status: StatusUnidade) {
    if (unidade.status === status) return
    setSalvandoId(unidade.id)
    setErro(null)
    setAviso(null)

    const supabase = criarClienteNavegador()
    const { error } = await supabase.from('unidades').update({ status }).eq('id', unidade.id)

    if (error) {
      setErro(`Falha ao mudar a situação de ${unidade.identificacao}: ${error.message}`)
      setSalvandoId(null)
      return
    }

    setUnidades(unidades.map((u) => (u.id === unidade.id ? { ...u, status } : u)))
    setSalvandoId(null)
    await revalidar()
  }

  async function adicionar(evento: React.FormEvent) {
    evento.preventDefault()
    const identificacao = nova.identificacao.trim()
    if (!identificacao) return
    setErro(null)
    setAviso(null)

    const supabase = criarClienteNavegador()
    const { data, error } = await supabase
      .from('unidades')
      .insert({
        empreendimento_id: empreendimentoId,
        identificacao,
        tipo: nova.tipo,
        status: 'disponivel',
        ordem: unidades.length + 1,
      })
      .select()
      .single()

    if (error) {
      setErro(`Falha ao adicionar unidade: ${error.message}`)
      return
    }

    setUnidades(ordenarUnidades([...unidades, data as Unidade]))
    setNova({ identificacao: '', tipo: nova.tipo })
    await revalidar()
  }

  async function arquivar(unidade: Unidade) {
    if (!confirm(`Arquivar ${unidade.identificacao}? Ela sai do site, mas pode ser restaurada.`))
      return

    setErro(null)
    setAviso(null)
    const marca = new Date().toISOString()
    const supabase = criarClienteNavegador()
    const { error } = await supabase
      .from('unidades')
      .update({ arquivado_em: marca })
      .eq('id', unidade.id)

    if (error) {
      setErro(`Falha ao arquivar ${unidade.identificacao}: ${error.message}`)
      return
    }

    setUnidades(unidades.filter((u) => u.id !== unidade.id))
    setArquivadas([...arquivadas, { ...unidade, arquivado_em: marca }])
    await revalidar()
  }

  async function restaurar(unidade: UnidadeAdmin) {
    setErro(null)
    setAviso(null)
    const supabase = criarClienteNavegador()
    const { error } = await supabase
      .from('unidades')
      .update({ arquivado_em: null })
      .eq('id', unidade.id)

    if (error) {
      setErro(`Falha ao restaurar ${unidade.identificacao}: ${error.message}`)
      return
    }

    setArquivadas(arquivadas.filter((u) => u.id !== unidade.id))
    setUnidades(ordenarUnidades([...unidades, { ...unidade, arquivado_em: undefined } as Unidade]))
    await revalidar()
  }

  return (
    <div>
      {erro && <p className={estilos.erro}>{erro}</p>}
      {aviso && <p className={estilos.aviso}>{aviso}</p>}

      <table className={estilos.tabela}>
        <thead>
          <tr>
            <th>Unidade</th>
            <th>Tipo</th>
            <th>Situação</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {unidades.map((u) => (
            <tr key={u.id} className={salvandoId === u.id ? estilos.salvando : undefined}>
              <td className={estilos.ident}>{u.identificacao}</td>
              <td>{rotuloTipoUnidade(u.tipo)}</td>
              <td>
                <div className={estilos.botoes}>
                  {STATUS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={salvandoId === u.id}
                      onClick={() => trocarStatus(u, s)}
                      className={u.status === s ? estilos.ativo : estilos.botao}
                    >
                      {rotuloStatus(s)}
                    </button>
                  ))}
                </div>
              </td>
              <td>
                <button type="button" className={estilos.arquivar} onClick={() => arquivar(u)}>
                  Arquivar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form className={estilos.nova} onSubmit={adicionar}>
        <input
          placeholder="Loja 21"
          value={nova.identificacao}
          onChange={(e) => setNova({ ...nova, identificacao: e.target.value })}
        />
        <select
          value={nova.tipo}
          onChange={(e) => setNova({ ...nova, tipo: e.target.value as TipoUnidade })}
        >
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {rotuloTipoUnidade(t)}
            </option>
          ))}
        </select>
        <button type="submit">Adicionar unidade</button>
      </form>

      {arquivadas.length > 0 && (
        <details className={estilos.arquivadas}>
          <summary>Arquivadas ({arquivadas.length})</summary>
          <ul>
            {arquivadas.map((u) => (
              <li key={u.id}>
                <span>
                  {u.identificacao} · {rotuloTipoUnidade(u.tipo)}
                </span>
                <button type="button" className={estilos.restaurar} onClick={() => restaurar(u)}>
                  Restaurar
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
