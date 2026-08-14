'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { TipoEmpreendimento } from '@/lib/tipos'
import { rotuloTipoEmpreendimento } from '@/lib/utils/rotulos'
import estilos from './Filtros.module.css'

const TIPOS: TipoEmpreendimento[] = [
  'centro_comercial',
  'residencial',
  'galpao',
  'sala_avulsa',
  'casa',
  'apartamento',
]

export function Filtros({ cidades }: { cidades: string[] }) {
  const router = useRouter()
  const caminho = usePathname()
  const params = useSearchParams()

  function alternar(chave: string, valor: string) {
    const novos = new URLSearchParams(params.toString())
    if (novos.get(chave) === valor) novos.delete(chave)
    else novos.set(chave, valor)

    const consulta = novos.toString()
    router.push(consulta ? `${caminho}?${consulta}` : caminho, { scroll: false })
  }

  const ativo = (chave: string, valor: string) => params.get(chave) === valor

  return (
    <div className={estilos.barra}>
      <div className={estilos.grupo}>
        <span className={estilos.rotulo}>Tipo</span>
        {TIPOS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => alternar('tipo', t)}
            className={ativo('tipo', t) ? estilos.ativo : estilos.botao}
          >
            {rotuloTipoEmpreendimento(t)}
          </button>
        ))}
      </div>

      <div className={estilos.grupo}>
        <span className={estilos.rotulo}>Cidade</span>
        {cidades.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => alternar('cidade', c)}
            className={ativo('cidade', c) ? estilos.ativo : estilos.botao}
          >
            {c}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => alternar('disponiveis', '1')}
        className={ativo('disponiveis', '1') ? estilos.ativo : estilos.botao}
      >
        Só com unidade livre
      </button>
    </div>
  )
}
