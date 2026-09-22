import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Cabecalho } from '@/components/site/Cabecalho'
import { Rodape } from '@/components/site/Rodape'
import { Transicao } from '@/components/site/Transicao'
import { Galeria } from '@/components/site/Galeria'
import { MapaEmbed } from '@/components/site/MapaEmbed'
import { TabelaUnidades } from '@/components/site/TabelaUnidades'
import { contarPorStatus } from '@/components/site/logicaUnidades'
import { listarSlugsPublicados, obterEmpreendimentoPorSlug } from '@/lib/dados/empreendimentos'
import { obterImovelAVendaPorSlug } from '@/lib/dados/vendas'
import { BlocoImovelAVenda } from '@/components/site/BlocoImovelAVenda'
import { rotuloTipoEmpreendimento } from '@/lib/utils/rotulos'
import { montarLinkWhatsApp } from '@/lib/utils/whatsapp'
import { extrairUrlMaps, linkBuscaMaps } from '@/lib/utils/maps'
import { URL_SITE } from '@/lib/site'
import { DadosEstruturados } from '@/components/site/DadosEstruturados'
import estilos from './page.module.css'

export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await listarSlugsPublicados()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const e = await obterEmpreendimentoPorSlug(slug)
  if (!e) return { title: 'Empreendimento não encontrado' }

  const capa = e.imagens.find((i) => i.tipo !== 'logo' && i.tipo !== 'planta') ?? e.imagens[0]
  const livres = e.unidades.filter((u) => u.status === 'disponivel').length

  const descricao =
    e.descricao ??
    (e.finalidade === 'venda'
      ? `Casas à venda em ${e.cidade}.`
      : `${rotuloTipoEmpreendimento(e.tipo)} em ${e.cidade}. ` +
        `${e.unidades.length} unidades, ${livres} disponíveis para locação.`)

  const caminho = `/empreendimentos/${e.slug}`

  return {
    title: e.nome,
    description: descricao,
    alternates: { canonical: caminho },
    openGraph: {
      type: 'article',
      url: caminho,
      title: e.nome,
      description: descricao,
      ...(capa && {
        images: [{ url: capa.url, alt: capa.alt ?? e.nome }],
      }),
    },
  }
}

export default async function Ficha({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const e = await obterEmpreendimentoPorSlug(slug)
  if (!e) notFound()

  // Imóvel à venda: a ficha é a vitrine dele, com o valor a consultar no
  // WhatsApp — a tabela de unidades e o "avise-me quando vagar" são coisa
  // de aluguel.
  if (e.finalidade === 'venda') {
    const venda = await obterImovelAVendaPorSlug(slug)
    if (!venda) notFound()
    return (
      <>
        <Cabecalho variante="escuro" />
        <Transicao>
          <main>
            <BlocoImovelAVenda imovel={venda} nivelTitulo={1} />
            <DadosEstruturados
              dados={{
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Início', item: URL_SITE },
                  { '@type': 'ListItem', position: 2, name: 'À venda', item: `${URL_SITE}/a-venda` },
                  {
                    '@type': 'ListItem',
                    position: 3,
                    name: venda.nome,
                  },
                ],
              }}
            />
          </main>
        </Transicao>
        <Rodape />
      </>
    )
  }

  const contagem = contarPorStatus(e.unidades)

  const local = e.localizacao_aproximada
    ? [e.bairro, e.cidade].filter(Boolean).join(' · ')
    : [e.endereco, e.bairro, `${e.cidade} — ${e.uf}`].filter(Boolean).join(', ')

  const comoChegar = e.maps_link ?? linkBuscaMaps(e)
  // Só URL de embed do Google entra no iframe: o código <iframe> colado no
  // CRM viraria endereço relativo do site (404 dentro do quadro).
  const mapa = e.maps_embed_url ? extrairUrlMaps(e.maps_embed_url) : null

  return (
    <>
      <Cabecalho />
      <Transicao>
        <main className={estilos.pagina}>
          <header className={estilos.cabecalho}>
            <p className={estilos.trilha}>
              {rotuloTipoEmpreendimento(e.tipo)}
              {e.built_to_suit && <span className={estilos.selo}>Built to suit</span>}
            </p>
            <h1 className={estilos.titulo}>{e.nome}</h1>
            <p className={estilos.local}>
              {local}
              {contagem.total > 0 && (
                <span className={estilos.disponibilidade}>
                  {contagem.disponivel} de {contagem.total} disponíveis
                </span>
              )}
            </p>
          </header>

          <div className={estilos.corpo}>
            <div className={estilos.principal}>
              <Galeria imagens={e.imagens} nome={e.nome} />

              {e.descricao && <p className={estilos.descricao}>{e.descricao}</p>}

              <h2 className={estilos.subtitulo}>Unidades</h2>
              <TabelaUnidades unidades={e.unidades} empreendimento={e.nome} />
            </div>

            <aside className={estilos.lateral}>
              <h2 className={estilos.subtitulo}>Localização</h2>
              {mapa ? (
                <MapaEmbed url={mapa} titulo={e.nome} />
              ) : (
                <p className={estilos.semMapa}>{local}</p>
              )}

              <a
                className={estilos.whatsapp}
                href={montarLinkWhatsApp({ empreendimento: e.nome })}
                target="_blank"
                rel="noopener noreferrer"
              >
                {contagem.disponivel > 0 ? 'Falar no WhatsApp' : 'Avise-me quando vagar'}
              </a>

              {comoChegar && (
                <a
                  className={estilos.comoChegar}
                  href={comoChegar}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Como chegar →
                </a>
              )}
            </aside>
          </div>

          <DadosEstruturados
            dados={{
              '@context': 'https://schema.org',
              '@type': 'Place',
              name: e.nome,
              description: e.descricao ?? undefined,
              url: `${URL_SITE}/empreendimentos/${e.slug}`,
              photo: e.imagens.map((i) => i.url),
              address: {
                '@type': 'PostalAddress',
                streetAddress: e.localizacao_aproximada ? undefined : e.endereco,
                addressLocality: e.cidade,
                addressRegion: e.uf,
                addressCountry: 'BR',
              },
            }}
          />

          <DadosEstruturados
            dados={{
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Início', item: URL_SITE },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Empreendimentos',
                  item: `${URL_SITE}/empreendimentos`,
                },
                { '@type': 'ListItem', position: 3, name: e.nome },
              ],
            }}
          />
        </main>
      </Transicao>
      <Rodape />
    </>
  )
}
