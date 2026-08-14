import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Cabecalho } from '@/components/site/Cabecalho'
import { Rodape } from '@/components/site/Rodape'
import { Galeria } from '@/components/site/Galeria'
import { MapaEmbed } from '@/components/site/MapaEmbed'
import { TabelaUnidades } from '@/components/site/TabelaUnidades'
import { contarPorStatus } from '@/components/site/logicaUnidades'
import { listarSlugsPublicados, obterEmpreendimentoPorSlug } from '@/lib/dados/empreendimentos'
import { rotuloTipoEmpreendimento, urlImagem } from '@/lib/utils/rotulos'
import { montarLinkWhatsApp } from '@/lib/utils/whatsapp'
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

  const capa = e.imagens[0]
  const livres = e.unidades.filter((u) => u.status === 'disponivel').length

  return {
    title: e.nome,
    description:
      e.descricao ??
      `${rotuloTipoEmpreendimento(e.tipo)} em ${e.cidade}. ` +
        `${e.unidades.length} unidades, ${livres} disponíveis para locação.`,
    openGraph: capa ? { images: [urlImagem(capa.storage_path)] } : undefined,
  }
}

export default async function Ficha({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const e = await obterEmpreendimentoPorSlug(slug)
  if (!e) notFound()

  const contagem = contarPorStatus(e.unidades)

  const local = e.localizacao_aproximada
    ? [e.bairro, e.cidade].filter(Boolean).join(' · ')
    : [e.endereco, e.bairro, `${e.cidade} — ${e.uf}`].filter(Boolean).join(', ')

  return (
    <>
      <Cabecalho />
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
            {e.maps_embed_url ? (
              <MapaEmbed url={e.maps_embed_url} titulo={e.nome} />
            ) : (
              <p className={estilos.semMapa}>
                {e.cidade} — {e.uf}
              </p>
            )}

            <a
              className={estilos.whatsapp}
              href={montarLinkWhatsApp({ empreendimento: e.nome })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {contagem.disponivel > 0 ? 'Falar no WhatsApp' : 'Avise-me quando vagar'}
            </a>

            {e.maps_link && (
              <a
                className={estilos.comoChegar}
                href={e.maps_link}
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
            address: {
              '@type': 'PostalAddress',
              streetAddress: e.localizacao_aproximada ? undefined : e.endereco,
              addressLocality: e.cidade,
              addressRegion: e.uf,
              addressCountry: 'BR',
            },
          }}
        />
      </main>
      <Rodape />
    </>
  )
}
