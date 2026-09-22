import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Cabecalho } from '@/components/site/Cabecalho'
import { Rodape } from '@/components/site/Rodape'
import { Transicao } from '@/components/site/Transicao'
import { Revelar } from '@/components/site/Revelar'
import { CardEmpreendimento } from '@/components/site/CardEmpreendimento'
import { Filtros } from '@/components/site/Filtros'
import { listarCidades, listarEmpreendimentos } from '@/lib/dados/empreendimentos'
import type { TipoEmpreendimento } from '@/lib/tipos'
import estilos from './page.module.css'

export const revalidate = 60

const DESCRICAO =
  'Galpões, centros comerciais, salas, lojas e apartamentos para locação, e casas à venda, em ' +
  'São Luís, São José de Ribamar e Pedreiras.'

export const metadata: Metadata = {
  title: 'Empreendimentos',
  description: DESCRICAO,
  alternates: { canonical: '/empreendimentos' },
  openGraph: {
    url: '/empreendimentos',
    title: 'Empreendimentos',
    description: DESCRICAO,
  },
}

export default async function Pagina({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; cidade?: string; disponiveis?: string }>
}) {
  const params = await searchParams

  const [lista, cidades] = await Promise.all([
    listarEmpreendimentos({
      tipo: params.tipo as TipoEmpreendimento | undefined,
      cidade: params.cidade,
      apenasDisponiveis: params.disponiveis === '1',
    }),
    listarCidades(),
  ])

  // O imóvel à venda abre a lista, num grupo próprio; o resto é o portfólio
  // de locação, como sempre foi.
  const aVenda = lista.filter((e) => e.finalidade === 'venda')
  const locacao = lista.filter((e) => e.finalidade !== 'venda')

  return (
    <>
      <Cabecalho />
      <Transicao>
        <main className={estilos.pagina}>
          <header className={estilos.cabecalho}>
            <p className={estilos.kicker}>Portfólio</p>
            <h1 className={estilos.titulo}>Empreendimentos</h1>
            <p className={estilos.contagem}>
              {lista.length} {lista.length === 1 ? 'empreendimento' : 'empreendimentos'}
            </p>
          </header>

          <Suspense>
            <Filtros cidades={cidades} />
          </Suspense>

          {aVenda.length > 0 && (
            <section className={estilos.grupo} aria-labelledby="titulo-a-venda">
              <div className={estilos.grupoTopo}>
                <h2 id="titulo-a-venda" className={estilos.grupoTitulo}>
                  À venda
                </h2>
                <Link href="/a-venda" className={estilos.verTodos}>
                  Ver a vitrine →
                </Link>
              </div>
              <div className={estilos.grade}>
                {aVenda.map((e, i) => (
                  <Revelar key={e.id} indice={i} esticar>
                    <CardEmpreendimento empreendimento={e} />
                  </Revelar>
                ))}
              </div>
            </section>
          )}

          {lista.length === 0 ? (
            <p className={estilos.vazio}>
              Nenhum empreendimento com esses filtros. Limpe os filtros para ver o portfólio
              completo.
            </p>
          ) : (
            locacao.length > 0 && (
              <section className={estilos.grupo} aria-labelledby="titulo-locacao">
                {aVenda.length > 0 && (
                  <h2 id="titulo-locacao" className={estilos.grupoTitulo}>
                    Para alugar
                  </h2>
                )}
                <div className={estilos.grade}>
                  {locacao.map((e, i) => (
                    <Revelar key={e.id} indice={i} esticar>
                      <CardEmpreendimento empreendimento={e} />
                    </Revelar>
                  ))}
                </div>
              </section>
            )
          )}
        </main>
      </Transicao>
      <Rodape />
    </>
  )
}
