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
import { CATEGORIAS, CENTER_VALLEY, CLIENTES, PASSOS } from '@/lib/conteudo'
import { DadosEstruturados } from '@/components/site/DadosEstruturados'
import estilos from './page.module.css'

export const revalidate = 60

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { url: '/' },
}

const WHATSAPP = 'https://wa.me/5598984812793'

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
            src="/hero-center-valley.jpg"
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
            <Link href="/empreendimentos" className={estilos.cta}>
              Ver empreendimentos
            </Link>
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

      {/* Sem foto de propósito: a do Center Valley já é o hero, e repeti-la a
          meia página seria a mesma imagem duas vezes. Aqui mandam os números. */}
      <section className={estilos.valley} aria-labelledby="titulo-valley">
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

            <div className={estilos.clientes}>
              {CLIENTES.map((g, i) => (
                <Revelar key={g.grupo} indice={i} esticar>
                  <div className={estilos.clienteGrupo}>
                    <span className={estilos.clienteRotulo}>{g.grupo}</span>
                    <ul>
                      {g.marcas.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </Revelar>
              ))}
            </div>
          </section>

          <section className={estilos.secao} aria-labelledby="titulo-passos">
            <Revelar>
              <h2 id="titulo-passos" className={estilos.secaoTitulo}>
                Como funciona
              </h2>
            </Revelar>
            <ol className={estilos.passos}>
              {PASSOS.map((p, i) => (
                <Revelar key={p.titulo} indice={i} esticar>
                  <li className={estilos.passo}>
                    <span className={estilos.passoNumero}>{String(i + 1).padStart(2, '0')}</span>
                    <h3 className={estilos.passoTitulo}>{p.titulo}</h3>
                    <p className={estilos.passoTexto}>{p.texto}</p>
                  </li>
                </Revelar>
              ))}
            </ol>
          </section>
        </div>

      <section className={estilos.chamada}>
        <Revelar>
          <h2 className={estilos.chamadaTitulo}>Procurando espaço para a sua operação?</h2>
          <p className={estilos.chamadaTexto}>
            {estatisticas.disponiveis} unidades disponíveis agora em São Luís, São José de
            Ribamar e Pedreiras.
          </p>
          <div className={estilos.chamadaAcoes}>
            <a
              className={estilos.chamadaPrincipal}
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
            >
              Falar no WhatsApp
            </a>
            <Link href="/empreendimentos?disponiveis=1" className={estilos.chamadaSecundaria}>
              Ver o que está livre →
            </Link>
          </div>
        </Revelar>
      </section>
      </main>

      <Rodape colado />

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
