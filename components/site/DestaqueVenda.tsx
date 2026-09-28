import Image from 'next/image'
import Link from 'next/link'
import type { ImovelAVenda } from '@/lib/tipos'
import { formatarArea, rotuloSituacaoVenda, situacaoDe } from '@/lib/vendas'
import { linkConsultarValor } from '@/lib/utils/whatsapp'
import { VideoVertical } from './VideoVertical'
import { Revelar } from './Revelar'
import estilos from './DestaqueVenda.module.css'

/**
 * A seção de venda da home: o vídeo em pé de um lado, as casas do outro,
 * cada uma com o caminho para consultar o valor, e o link para a vitrine.
 * Um bloco por imóvel à venda.
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
                  const area = u.area_m2 !== null ? formatarArea(u.area_m2) : ''
                  const situacao = situacaoDe(u)
                  const disponivel = situacao === 'a_venda'
                  return (
                    <li key={u.id} className={disponivel ? undefined : estilos.indisponivel}>
                      <span className={estilos.casaNome}>{u.identificacao}</span>
                      <span className={estilos.casaInfo}>
                        {disponivel ? area : rotuloSituacaoVenda(situacao)}
                      </span>
                      {disponivel && (
                        <a
                          className={estilos.consultar}
                          href={linkConsultarValor({ empreendimento: e.nome, unidade: u.identificacao })}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Consultar valor →
                        </a>
                      )}
                    </li>
                  )
                })}
              </ul>

              <div className={estilos.acoes}>
                <Link href="/a-venda" className={estilos.cta}>
                  Conhecer as casas
                </Link>
                <a
                  className={estilos.ctaLivre}
                  href={linkConsultarValor({ empreendimento: e.nome })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Falar no WhatsApp →
                </a>
              </div>
            </Revelar>
          </div>
        </section>
      ))}
    </>
  )
}
