import Image from 'next/image'
import Link from 'next/link'
import { Cabecalho } from '@/components/site/Cabecalho'
import { Rodape } from '@/components/site/Rodape'
import { CardEmpreendimento } from '@/components/site/CardEmpreendimento'
import {
  listarBuiltToSuit,
  listarEmpreendimentos,
  obterEstatisticas,
} from '@/lib/dados/empreendimentos'
import { urlImagem } from '@/lib/utils/rotulos'
import estilos from './page.module.css'

export const revalidate = 60

export default async function Home() {
  const [estatisticas, destaques, cases] = await Promise.all([
    obterEstatisticas(),
    listarEmpreendimentos(),
    listarBuiltToSuit(),
  ])

  const emDestaque = destaques.filter((e) => e.destaque).slice(0, 3)
  const capaHero = destaques.find((e) => e.capa)?.capa

  return (
    <>
      <div className={estilos.topo}>
        <Cabecalho variante="escuro" />

        <section className={estilos.hero}>
          {capaHero && (
            <Image
              src={urlImagem(capaHero.storage_path)}
              alt=""
              fill
              priority
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              className={estilos.heroFoto}
            />
          )}
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

      <main className={estilos.conteudo}>
        <section className={estilos.secao}>
          <div className={estilos.secaoTopo}>
            <h2 className={estilos.secaoTitulo}>Em destaque</h2>
            <Link href="/empreendimentos" className={estilos.verTodos}>
              Ver todos →
            </Link>
          </div>
          <div className={estilos.grade}>
            {emDestaque.map((e) => (
              <CardEmpreendimento key={e.id} empreendimento={e} />
            ))}
          </div>
        </section>

        <section className={estilos.secao}>
          <h2 className={estilos.secaoTitulo}>Built to suit</h2>
          <p className={estilos.secaoTexto}>
            Imóveis construídos sob medida para operações de grande porte, entre elas as
            unidades do Grupo Mateus em Maiobão e Pedreiras.
          </p>
          <div className={estilos.grade}>
            {cases.map((e) => (
              <CardEmpreendimento key={e.id} empreendimento={e} />
            ))}
          </div>
        </section>
      </main>

      <Rodape />
    </>
  )
}
