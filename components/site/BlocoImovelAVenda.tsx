import Image from 'next/image'
import type { ImovelAVenda } from '@/lib/tipos'
import { formatarArea, formatarPreco } from '@/lib/vendas'
import { CONDICOES_VENDA, CHAMADA_VENDA } from '@/lib/conteudo-venda'
import { montarLinkWhatsApp } from '@/lib/utils/whatsapp'
import { linkBuscaMaps } from '@/lib/utils/maps'
import { URL_SITE } from '@/lib/site'
import { CardCasaAVenda } from './CardCasaAVenda'
import { VideoVertical } from './VideoVertical'
import { Galeria } from './Galeria'
import { MapaEmbed } from './MapaEmbed'
import { Revelar } from './Revelar'
import { DadosEstruturados } from './DadosEstruturados'
import estilos from './BlocoImovelAVenda.module.css'

/**
 * A vitrine de um imóvel à venda: abertura escura com logo, vídeo em pé e os
 * números; as casas com preço à vista; implantação; fotos; condições e
 * localização. É o mesmo bloco em /a-venda e na ficha do imóvel.
 */
export function BlocoImovelAVenda({
  imovel: e,
  nivelTitulo = 2,
}: {
  imovel: ImovelAVenda
  nivelTitulo?: 1 | 2
}) {
  const Titulo = nivelTitulo === 1 ? 'h1' : 'h2'
  const Sub = nivelTitulo === 1 ? 'h2' : 'h3'
  const idCasas = `casas-${e.slug}`
  const area = e.unidades.find((u) => u.area_m2 !== null)?.area_m2 ?? null
  const contato = montarLinkWhatsApp({ empreendimento: e.nome })
  const local = e.localizacao_aproximada
    ? [e.bairro, e.cidade].filter(Boolean).join(' · ')
    : [e.endereco, e.bairro, `${e.cidade} — ${e.uf}`].filter(Boolean).join(', ')
  const comoChegar = e.maps_link ?? linkBuscaMaps(e)

  return (
    <article className={estilos.bloco} aria-labelledby={`titulo-${e.slug}`}>
      <section className={estilos.abertura}>
        <div className={estilos.aberturaGrade}>
          <Revelar className={estilos.aberturaTexto}>
            {e.logo && (
              <div className={estilos.logoCaixa}>
                <Image
                  src={e.logo.url}
                  alt={e.logo.alt ?? `Logo ${e.nome}`}
                  width={240}
                  height={108}
                  className={estilos.logo}
                />
              </div>
            )}
            <p className={estilos.kicker}>
              {[e.bairro, `${e.cidade} — ${e.uf}`].filter(Boolean).join(' · ')} · Casas à venda
            </p>
            <Titulo id={`titulo-${e.slug}`} className={estilos.titulo}>
              {e.nome}
            </Titulo>
            {e.descricao && <p className={estilos.linha}>{e.descricao}</p>}

            <div className={estilos.numeros}>
              <div>
                <b>{e.aVenda}</b>
                <small>{e.aVenda === 1 ? 'casa à venda' : 'casas à venda'}</small>
              </div>
              {area !== null && (
                <div>
                  <b>{formatarArea(area)}</b>
                  <small>Área construída</small>
                </div>
              )}
              {e.menorPreco !== null && (
                <div>
                  <b>{formatarPreco(e.menorPreco)}</b>
                  <small>A partir de, à vista</small>
                </div>
              )}
            </div>

            <div className={estilos.acoes}>
              <a className={estilos.cta} href={contato} target="_blank" rel="noopener noreferrer">
                Formule sua proposta
              </a>
              <a className={estilos.ctaLivre} href={`#${idCasas}`}>
                Ver as casas ↓
              </a>
            </div>
          </Revelar>

          <div className={estilos.aberturaVideo}>
            {e.video_url ? (
              <VideoVertical src={e.video_url} poster={e.capa?.url} titulo={`Vídeo do ${e.nome}`} />
            ) : (
              e.capa && (
                <div className={estilos.capaSemVideo}>
                  <Image
                    src={e.capa.url}
                    alt={e.capa.alt ?? e.nome}
                    fill
                    sizes="(max-width: 860px) 100vw, 40vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <div className={estilos.conteudo}>
        <section id={idCasas} className={estilos.secao} aria-label={`Casas do ${e.nome}`}>
          <Revelar>
            <Sub className={estilos.secaoTitulo}>As casas</Sub>
            <p className={estilos.secaoTexto}>
              Preço à vista de cada unidade. {CHAMADA_VENDA}
            </p>
          </Revelar>
          <div className={estilos.gradeCasas}>
            {e.unidades.map((u, i) => (
              <Revelar key={u.id} indice={i} esticar>
                <CardCasaAVenda unidade={u} empreendimento={e.nome} />
              </Revelar>
            ))}
          </div>
        </section>

        {e.planta && (
          <section className={estilos.secao} aria-label="Implantação">
            <Revelar>
              <Sub className={estilos.secaoTitulo}>Implantação</Sub>
            </Revelar>
            <Revelar>
              <figure className={estilos.planta}>
                <Image
                  src={e.planta.url}
                  alt={e.planta.alt ?? `Implantação do ${e.nome}`}
                  width={1938}
                  height={1090}
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className={estilos.plantaImagem}
                />
                {e.planta.alt && <figcaption>{e.planta.alt}</figcaption>}
              </figure>
            </Revelar>
          </section>
        )}

        {e.fotos.length > 0 && (
          <section className={estilos.secao} aria-label="Fotos">
            <Revelar>
              <Sub className={estilos.secaoTitulo}>Fotos</Sub>
            </Revelar>
            <Galeria imagens={e.fotos} nome={e.nome} />
          </section>
        )}

        <section className={estilos.rodapeGrade}>
          <div>
            <Sub className={estilos.secaoTitulo}>Condições</Sub>
            <ul className={estilos.condicoes}>
              {CONDICOES_VENDA.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <aside className={estilos.lateral}>
            <Sub className={estilos.secaoTitulo}>Localização</Sub>
            {e.maps_embed_url ? (
              <MapaEmbed url={e.maps_embed_url} titulo={e.nome} />
            ) : (
              <p className={estilos.endereco}>{local}</p>
            )}
            {e.maps_embed_url && <p className={estilos.endereco}>{local}</p>}
            <a className={estilos.whatsapp} href={contato} target="_blank" rel="noopener noreferrer">
              Falar no WhatsApp
            </a>
            {comoChegar && (
              <a className={estilos.comoChegar} href={comoChegar} target="_blank" rel="noopener noreferrer">
                Como chegar →
              </a>
            )}
          </aside>
        </section>
      </div>

      <DadosEstruturados
        dados={{
          '@context': 'https://schema.org',
          '@type': 'SingleFamilyResidence',
          name: e.nome,
          description: e.descricao ?? undefined,
          url: `${URL_SITE}/empreendimentos/${e.slug}`,
          photo: e.fotos.map((i) => i.url),
          address: {
            '@type': 'PostalAddress',
            streetAddress: e.localizacao_aproximada ? undefined : e.endereco,
            addressLocality: e.cidade,
            addressRegion: e.uf,
            addressCountry: 'BR',
          },
          offers: e.unidades
            .filter((u) => u.venda?.situacao === 'a_venda')
            .map((u) => ({
              '@type': 'Offer',
              name: u.identificacao,
              price: u.venda!.valor_venda,
              priceCurrency: 'BRL',
              availability: 'https://schema.org/InStock',
            })),
        }}
      />
    </article>
  )
}
