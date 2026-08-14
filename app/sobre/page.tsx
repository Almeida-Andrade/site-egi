import type { Metadata } from 'next'
import { Cabecalho } from '@/components/site/Cabecalho'
import { Rodape } from '@/components/site/Rodape'
import { obterEstatisticas } from '@/lib/dados/empreendimentos'
import estilos from './page.module.css'

export const revalidate = 300

const DESCRICAO =
  'A E.G.I Empreendimentos administra e loca imóveis próprios em São Luís, ' +
  'São José de Ribamar e Pedreiras — de galpões de grande porte a apartamentos.'

export const metadata: Metadata = {
  title: 'A EGI',
  description: DESCRICAO,
  alternates: { canonical: '/sobre' },
  openGraph: { url: '/sobre', title: 'A EGI', description: DESCRICAO },
}

export default async function Sobre() {
  const e = await obterEstatisticas()

  return (
    <>
      <Cabecalho />
      <main className={estilos.pagina}>
        <p className={estilos.kicker}>A EGI</p>
        <h1 className={estilos.titulo}>
          Um portfólio que vai do <em>galpão âncora</em> ao apartamento.
        </h1>

        <div className={estilos.texto}>
          <p>
            A E.G.I Empreendimentos administra e loca imóveis próprios no Maranhão. O
            portfólio reúne centros comerciais, galpões logísticos, salas, lojas, casas e
            condomínios residenciais em São Luís, São José de Ribamar e Pedreiras.
          </p>
          <p>
            Trabalhamos também com built to suit: imóveis construídos sob medida para a
            operação do locatário, como as unidades do Grupo Mateus em Maiobão e Pedreiras.
            E com core and shell, em que a estrutura é entregue pronta para o cliente
            personalizar por dentro — caminho das unidades Selfit e Skyfit.
          </p>
          <p>
            Entre os locatários dos nossos imóveis estão Grupo Mateus, Caixa Econômica
            Federal, Selfit, Skyfit, Pague Menos, Shineray e órgãos públicos estaduais e
            municipais.
          </p>
          <p>
            Por sermos proprietários dos imóveis que administramos, a negociação é direta —
            sem intermediação, sem cadeia de comissões.
          </p>
        </div>

        {/* "Anos de mercado" fica por último: hoje o portfólio tem 18
            empreendimentos, e dois "18" lado a lado se leem como erro. */}
        <div className={estilos.numeros}>
          <div>
            <b>{e.empreendimentos}</b>
            <small>Empreendimentos</small>
          </div>
          <div>
            <b>{e.unidades}</b>
            <small>Unidades</small>
          </div>
          <div>
            <b>{e.ocupacao}%</b>
            <small>Taxa de ocupação</small>
          </div>
          <div>
            <b>18+</b>
            <small>Anos de mercado</small>
          </div>
        </div>
      </main>
      <Rodape />
    </>
  )
}
