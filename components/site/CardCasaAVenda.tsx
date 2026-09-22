import type { UnidadeAVenda } from '@/lib/tipos'
import { formatarArea, formatarPreco, orientacaoSolar, rotuloSituacaoVenda } from '@/lib/vendas'
import { montarLinkWhatsApp } from '@/lib/utils/whatsapp'
import estilos from './CardCasaAVenda.module.css'

/** Uma casa da vitrine: número, sol, área, o que tem, preço à vista e o contato. */
export function CardCasaAVenda({
  unidade: u,
  empreendimento,
  escuro = false,
}: {
  unidade: UnidadeAVenda
  empreendimento: string
  escuro?: boolean
}) {
  const sol = orientacaoSolar(u.caracteristicas)
  const detalhes = u.caracteristicas.filter((c) => c !== sol)
  const situacao = u.venda?.situacao ?? 'a_venda'
  const disponivel = situacao === 'a_venda'

  return (
    <article
      className={[estilos.card, escuro && estilos.escuro, !disponivel && estilos.indisponivel]
        .filter(Boolean)
        .join(' ')}
    >
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

      <p className={estilos.preco}>
        {u.venda ? (
          <>
            <b>{formatarPreco(u.venda.valor_venda)}</b>
            <small>à vista</small>
          </>
        ) : (
          <b className={estilos.consulta}>Sob consulta</b>
        )}
      </p>

      {disponivel && (
        <a
          className={estilos.contato}
          href={montarLinkWhatsApp({ empreendimento, unidade: u.identificacao })}
          target="_blank"
          rel="noopener noreferrer"
        >
          Tenho interesse →
        </a>
      )}
    </article>
  )
}
