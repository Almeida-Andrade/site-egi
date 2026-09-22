import type { UnidadeAVenda } from '@/lib/tipos'
import { formatarArea, orientacaoSolar, rotuloSituacaoVenda, situacaoDe } from '@/lib/vendas'
import { linkConsultarValor } from '@/lib/utils/whatsapp'
import estilos from './CardCasaAVenda.module.css'

/** Uma casa da vitrine: número, sol, área, o que tem, e a chamada para consultar o valor. */
export function CardCasaAVenda({
  unidade: u,
  empreendimento,
}: {
  unidade: UnidadeAVenda
  empreendimento: string
}) {
  const sol = orientacaoSolar(u.caracteristicas)
  const detalhes = u.caracteristicas.filter((c) => c !== sol)
  const situacao = situacaoDe(u)
  const disponivel = situacao === 'a_venda'

  return (
    <article className={[estilos.card, !disponivel && estilos.indisponivel].filter(Boolean).join(' ')}>
      <header className={estilos.topo}>
        <h3 className={estilos.numero}>{u.identificacao}</h3>
        <span className={estilos.situacao}>{rotuloSituacaoVenda(situacao)}</span>
      </header>

      <dl className={estilos.dados}>
        {sol && (
          <div>
            <dt>Sol</dt>
            <dd>{sol}</dd>
          </div>
        )}
        {u.area_m2 !== null && (
          <div>
            <dt>Área construída</dt>
            <dd>{formatarArea(u.area_m2)}</dd>
          </div>
        )}
      </dl>

      {detalhes.length > 0 && (
        <ul className={estilos.detalhes}>
          {detalhes.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}

      <div className={estilos.rodape}>
        {disponivel ? (
          <a
            className={estilos.cta}
            href={linkConsultarValor({ empreendimento, unidade: u.identificacao })}
            target="_blank"
            rel="noopener noreferrer"
          >
            Consultar valor
          </a>
        ) : (
          <span className={estilos.encerrada}>{rotuloSituacaoVenda(situacao)}</span>
        )}
      </div>
    </article>
  )
}
