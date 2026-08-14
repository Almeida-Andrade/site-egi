'use client'

import { useState } from 'react'
import type { StatusUnidade, Unidade } from '@/lib/tipos'
import { ChipStatus } from './ChipStatus'
import { contarPorStatus, temAlgumaArea, temAlgumPiso } from './logicaUnidades'
import { rotuloTipoUnidade } from '@/lib/utils/rotulos'
import { montarLinkWhatsApp } from '@/lib/utils/whatsapp'
import estilos from './TabelaUnidades.module.css'

type Aba = 'todas' | StatusUnidade

export function TabelaUnidades({
  unidades,
  empreendimento,
}: {
  unidades: Unidade[]
  empreendimento: string
}) {
  const [aba, setAba] = useState<Aba>('todas')
  const contagem = contarPorStatus(unidades)
  const mostrarArea = temAlgumaArea(unidades)
  const mostrarPiso = temAlgumPiso(unidades)

  const visiveis = aba === 'todas' ? unidades : unidades.filter((u) => u.status === aba)

  const abas: { chave: Aba; texto: string; qtd: number }[] = [
    { chave: 'todas', texto: 'Todas', qtd: contagem.total },
    { chave: 'disponivel', texto: 'Disponíveis', qtd: contagem.disponivel },
    { chave: 'ocupado', texto: 'Ocupadas', qtd: contagem.ocupado },
  ]
  if (contagem.reservado > 0) {
    abas.push({ chave: 'reservado', texto: 'Reservadas', qtd: contagem.reservado })
  }
  if (contagem.manutencao > 0) {
    abas.push({ chave: 'manutencao', texto: 'Em manutenção', qtd: contagem.manutencao })
  }

  return (
    <section>
      <div className={estilos.abas}>
        {abas.map((a) => (
          <button
            key={a.chave}
            type="button"
            onClick={() => setAba(a.chave)}
            className={aba === a.chave ? estilos.abaAtiva : estilos.aba}
          >
            {a.texto} <span>{a.qtd}</span>
          </button>
        ))}
      </div>

      <table className={estilos.tabela}>
        <thead>
          <tr>
            <th>Unidade</th>
            <th>Tipo</th>
            {mostrarArea && <th>Área</th>}
            {mostrarPiso && <th>Piso</th>}
            <th>Situação</th>
            <th>
              <span className="sr-only">Contato</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {visiveis.map((u) => (
            <tr key={u.id} id={`unidade-${u.id}`}>
              <td className={estilos.ident}>{u.identificacao}</td>
              <td>{rotuloTipoUnidade(u.tipo)}</td>
              {mostrarArea && (
                <td className={estilos.num}>
                  {u.area_m2 ? `${u.area_m2.toLocaleString('pt-BR')} m²` : '—'}
                </td>
              )}
              {mostrarPiso && <td>{u.piso ?? '—'}</td>}
              <td>
                <ChipStatus status={u.status} />
              </td>
              <td className={estilos.acaoCelula}>
                {u.status === 'disponivel' && (
                  <a
                    className={estilos.acao}
                    href={montarLinkWhatsApp({ empreendimento, unidade: u.identificacao })}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Tenho interesse →
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {visiveis.length === 0 && <p className={estilos.vazio}>Nenhuma unidade nessa situação.</p>}
    </section>
  )
}
