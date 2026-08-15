import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Cabecalho } from '@/components/site/Cabecalho'
import { Rodape } from '@/components/site/Rodape'
import { Transicao } from '@/components/site/Transicao'
import { Revelar } from '@/components/site/Revelar'
import { CardEmpreendimento } from '@/components/site/CardEmpreendimento'
import {
  listarBuiltToSuit,
  listarEmpreendimentos,
  obterEstatisticas,
} from '@/lib/dados/empreendimentos'
import { CarrosselMarcas } from '@/components/site/CarrosselMarcas'
import { OndeEstamos } from '@/components/site/OndeEstamos'
import { CATEGORIAS, CENTER_VALLEY } from '@/lib/conteudo'
import { DadosEstruturados } from '@/components/site/DadosEstruturados'
import estilos from './page.module.css'

export const revalidate = 60

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { url: '/' },
}

export default async function Home() {
  const [estatisticas, portfolio, cases] = await Promise.all([
    obterEstatisticas(),
    listarEmpreendimentos(),
    listarBuiltToSuit(),
  ])

  // Os built to suit têm seção própria logo abaixo; repeti-los aqui encheria a
  // home com os mesmos três cartões duas vezes.
  const emDestaque = portfolio.filter((e) => e.destaque && !e.built_to_suit).slice(0, 3)

  // Categoria sem imóvel nenhum não vira porta de entrada para uma lista vazia.
  const categorias = CATEGORIAS.map((c) => ({
    ...c,
    quantidade: portfolio.filter((e) => e.tipo === c.tipo).length,
  })).filter((c) => c.quantidade > 0)

  return (
    <Transicao>
      <div className={estilos.topo}>
        <Cabecalho variante="escuro" />

        <section className={estilos.hero}>
          {/* Imagem fixa, não a capa de um empreendimento: a primeira dobra não
              deve mudar de cara quando o portfólio for reordenado no painel. */}
          <Image
            src="/hero-corporativo.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            className={estilos.heroFoto}
          />
          <div className={estilos.heroTexto}>
            <p className={estilos.kicker}>São Luís · Maranhão</p>
            <h1 className={estilos.titulo}>
              Grandes empreendimentos
              <br />
              começam com <em>grandes sonhos</em>.
            </h1>
            <div className={estilos.filete} />
            <div className={estilos.heroAcoes}>
              <Link href="/empreendimentos" className={estilos.cta}>
                Ver empreendimentos
              </Link>
              {/* Ocupou o lugar do item "Disponíveis", que saiu do menu. Aqui o
                  atalho ainda diz quantas unidades estão livres. */}
              {estatisticas.disponiveis > 0 && (
                <Link href="/empreendimentos?disponiveis=1" className={estilos.ctaLivre}>
                  {estatisticas.disponiveis} unidades disponíveis agora →
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className={estilos.numeros} aria-label="A EGI em números">
          <div>
            <b>{estatisticas.empreendimentos}</b>
            <small>Empreendimentos</small>
          </div>
          <div>
            <b>{estatisticas.unidades}</b>
            <small>Unidades</small>
          </div>
          <div>
            <b>{estatisticas.ocupacao}%</b>
            <small>Taxa de ocupação</small>
          </div>
          <div>
            <b>{estatisticas.disponiveis}</b>
            <small>Disponíveis agora</small>
          </div>
        </section>
      </div>

      <main>
        <div className={estilos.conteudo}>
          <section className={estilos.secao} aria-labelledby="titulo-categorias">
            <Revelar>
              <h2 id="titulo-categorias" className={estilos.secaoTitulo}>
                O que a EGI aluga
              </h2>
            </Revelar>
            <div className={estilos.categorias}>
              {categorias.map((c, i) => (
                <Revelar key={c.tipo} indice={i} esticar>
                  <Link href={`/empreendimentos?tipo=${c.tipo}`} className={estilos.categoria}>
                    <span className={estilos.categoriaConta}>
                      {c.quantidade} {c.quantidade === 1 ? 'imóvel' : 'imóveis'}
                    </span>
                    <h3 className={estilos.categoriaNome}>{c.rotulo}</h3>
                    <p className={estilos.categoriaTexto}>{c.descricao}</p>
                    <span className={estilos.categoriaSeta} aria-hidden>
                      →
                    </span>
                  </Link>
                </Revelar>
              ))}
            </div>
          </section>

          <section className={estilos.secao} aria-labelledby="titulo-destaque">
            <Revelar>
              <div className={estilos.secaoTopo}>
                <h2 id="titulo-destaque" className={estilos.secaoTitulo}>
                  Em destaque
                </h2>
                <Link href="/empreendimentos" className={estilos.verTodos}>
                  Ver todos →
                </Link>
              </div>
            </Revelar>
            <div className={estilos.grade}>
              {emDestaque.map((e, i) => (
                <Revelar key={e.id} indice={i} esticar>
                  <CardEmpreendimento empreendimento={e} />
                </Revelar>
              ))}
            </div>
          </section>

          <section className={estilos.secao} aria-labelledby="titulo-bts">
            <Revelar>
              <h2 id="titulo-bts" className={estilos.secaoTitulo}>
                Built to suit
              </h2>
              <p className={estilos.secaoTexto}>
                Imóveis construídos sob medida para operações de grande porte, entre elas as
                unidades do Grupo Mateus em Maiobão e Pedreiras. Em core and shell a estrutura
                é entregue pronta para o cliente personalizar por dentro — caminho das
                unidades Selfit e Skyfit.
              </p>
            </Revelar>
            <div className={estilos.grade}>
              {cases.map((e, i) => (
                <Revelar key={e.id} indice={i} esticar>
                  <CardEmpreendimento empreendimento={e} />
                </Revelar>
              ))}
            </div>
          </section>
        </div>

      {/* Mesma fotografia do hero, em recorte fechado no letreiro e na entrada.
          O hero mostra o conjunto sob véu escuro; aqui o prédio aparece limpo,
          e os dois enquadramentos não se leem como repetição. */}
      <section className={estilos.valley} aria-labelledby="titulo-valley">
        <div className={estilos.valleyFoto}>
          <Image
            src="/center-valley-entrada.jpg"
            alt="Entrada do Center Valley Shopping, em Pedreiras"
            fill
            sizes="(max-width: 900px) 100vw, 45vw"
            style={{ objectFit: 'cover' }}
          />
        </div>

        <Revelar className={estilos.valleyTexto}>
          <p className={estilos.kickerClaro}>{CENTER_VALLEY.cidade}</p>
          <h2 id="titulo-valley" className={estilos.valleyTitulo}>
            Center Valley Shopping
          </h2>
          <p className={estilos.valleyLinha}>
            O maior centro comercial do Médio Mearim, entregue pelo grupo em{' '}
            {CENTER_VALLEY.entrega.toLowerCase()}.
          </p>

          <div className={estilos.valleyNumeros}>
            {CENTER_VALLEY.destaques.map((d) => (
              <div key={d.rotulo}>
                <b>{d.valor}</b>
                <small>{d.rotulo}</small>
              </div>
            ))}
          </div>

          <ul className={estilos.valleyLista}>
            {CENTER_VALLEY.equipamentos.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Revelar>
      </section>

        <div className={estilos.conteudo}>
          <section className={estilos.secao} aria-labelledby="titulo-clientes">
            <Revelar>
              <h2 id="titulo-clientes" className={estilos.secaoTitulo}>
                Quem ocupa nossos imóveis
              </h2>
              <p className={estilos.secaoTexto}>
                Redes nacionais, instituições financeiras e órgãos públicos operam em imóveis
                da EGI.
              </p>
            </Revelar>

            <Revelar className={estilos.marcas}>
              <CarrosselMarcas />
            </Revelar>
          </section>
        </div>

        <OndeEstamos />
      </main>

      <Rodape />

      <DadosEstruturados
        dados={{
          '@context': 'https://schema.org',
          '@type': 'RealEstateAgent',
          name: 'E.G.I Empreendimentos',
          telephone: '+55-98-3235-5008',
          email: 'egiempreendimentos@grupoalmeidaandrade.com.br',
          areaServed: ['São Luís', 'São José de Ribamar', 'Pedreiras'],
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Av. dos Sambaquis, 34 — Ed. Galeria A',
            addressLocality: 'São Luís',
            addressRegion: 'MA',
            addressCountry: 'BR',
          },
          sameAs: ['https://www.instagram.com/egi.empreendimentos/'],
        }}
      />
    </Transicao>
  )
}
