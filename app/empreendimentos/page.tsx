import { Suspense } from 'react'
import type { Metadata } from 'next'
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

          {/* Locação e venda na mesma grade: o que distingue o imóvel à venda
              é o selo do cartão, não um grupo à parte. */}
          {lista.length === 0 ? (
            <p className={estilos.vazio}>
              Nenhum empreendimento com esses filtros. Limpe os filtros para ver o portfólio
              completo.
            </p>
          ) : (
            <div className={estilos.grade}>
              {lista.map((e, i) => (
                <Revelar key={e.id} indice={i} esticar>
                  <CardEmpreendimento empreendimento={e} />
                </Revelar>
              ))}
            </div>
          )}
        </main>
      </Transicao>
      <Rodape />
    </>
  )
}
