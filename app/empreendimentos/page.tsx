import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Cabecalho } from '@/components/site/Cabecalho'
import { Rodape } from '@/components/site/Rodape'
import { CardEmpreendimento } from '@/components/site/CardEmpreendimento'
import { Filtros } from '@/components/site/Filtros'
import { listarCidades, listarEmpreendimentos } from '@/lib/dados/empreendimentos'
import type { TipoEmpreendimento } from '@/lib/tipos'
import estilos from './page.module.css'

export const revalidate = 60

const DESCRICAO =
  'Galpões, centros comerciais, salas, lojas e apartamentos para locação em ' +
  'São Luís, São José de Ribamar e Pedreiras.'

export const metadata: Metadata = {
  title: 'Empreendimentos',
  description: DESCRICAO,
  // Canônica sem query: os filtros de tipo, cidade e disponibilidade geram
  // dezenas de URLs com o mesmo conteúdo recortado.
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

        {lista.length === 0 ? (
          <p className={estilos.vazio}>
            Nenhum empreendimento com esses filtros. Limpe os filtros para ver o portfólio
            completo.
          </p>
        ) : (
          <div className={estilos.grade}>
            {lista.map((e) => (
              <CardEmpreendimento key={e.id} empreendimento={e} />
            ))}
          </div>
        )}
      </main>
      <Rodape />
    </>
  )
}
