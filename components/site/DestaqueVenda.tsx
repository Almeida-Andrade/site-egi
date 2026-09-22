import Image from 'next/image'
import Link from 'next/link'
import type { ImovelAVenda } from '@/lib/tipos'
import { formatarPreco, orientacaoSolar, rotuloSituacaoVenda } from '@/lib/vendas'
import { VideoVertical } from './VideoVertical'
import { Revelar } from './Revelar'
import estilos from './DestaqueVenda.module.css'

/**
 * A seção de venda da home: o vídeo em pé de um lado, as casas com preço do
 * outro, e o caminho para a vitrine. Um bloco por imóvel à venda.
 */
export function DestaqueVenda({ imoveis }: { imoveis: ImovelAVenda[] }) {
  if (imoveis.length === 0) return null

  return (
    <>
      {imoveis.map((e) => (
        <section key={e.id} className={estilos.secao} aria-labelledby={`destaque-${e.slug}`}>
          <div className={estilos.grade}>
            <div className={estilos.video}>
              {e.video_url ? (
                <VideoVertical src={e.video_url} poster={e.capa?.url} titulo={`Vídeo do ${e.nome}`} compacto />
              ) : (
                e.capa && (
                  <div className={estilos.capa}>
                    <Image src={e.capa.url} alt={e.capa.alt ?? e.nome} fill sizes="(max-width: 860px) 100vw, 34vw" style={{ objectFit: 'cover' }} />
                  </div>
                )
              )}
            </div>

            <Revelar className={estilos.texto}>
              <p className={estilos.kicker}>
                Casas à venda · {[e.bairro, e.cidade].filter(Boolean).join(' · ')}
              </p>
              <h2 id={`destaque-${e.slug}`} className={estilos.titulo}>
                {e.nome}
              </h2>
              {e.descricao && <p className={estilos.linha}>{e.descricao}</p>}

              <ul className={estilos.casas}>
                {e.unidades.map((u) => {
                  const sol = orientacaoSolar(u.caracteristicas)
                  const situacao = u.venda?.situacao ?? 'a_venda'
                  return (
                    <li key={u.id} className={situacao !== 'a_venda' ? estilos.indisponivel : undefined}>
                      <span className={estilos.casaNome}>{u.identificacao}</span>
                      <span className={estilos.casaSol}>
                        {situacao === 'a_venda' ? (sol ?? '') : rotuloSituacaoVenda(situacao)}
                      </span>
                      <span className={estilos.casaPreco}>
                        {u.venda ? formatarPreco(u.venda.valor_venda) : 'Sob consulta'}
                      </span>
                    </li>
                  )
                })}
              </ul>
              <p className={estilos.nota}>Preço à vista.</p>

              <Link href="/a-venda" className={estilos.cta}>
                Conhecer as casas →
              </Link>
            </Revelar>
          </div>
        </section>
      ))}
    </>
  )
}
