import type { Metadata } from 'next'
import Link from 'next/link'
import { Cabecalho } from '@/components/site/Cabecalho'
import { Rodape } from '@/components/site/Rodape'
import { Transicao } from '@/components/site/Transicao'
import { BlocoImovelAVenda } from '@/components/site/BlocoImovelAVenda'
import { listarImoveisAVenda } from '@/lib/dados/vendas'
import estilos from './page.module.css'

export const revalidate = 60

const DESCRICAO =
  'Casas prontas para morar, à venda em São Luís. Preço à vista de cada unidade, ' +
  'fotos, vídeo e implantação do condomínio.'

export const metadata: Metadata = {
  title: 'Casas à venda',
  description: DESCRICAO,
  alternates: { canonical: '/a-venda' },
  openGraph: {
    url: '/a-venda',
    title: 'Casas à venda',
    description: DESCRICAO,
  },
}

export default async function PaginaAVenda() {
  const imoveis = await listarImoveisAVenda()
  const casas = imoveis.reduce((a, e) => a + e.aVenda, 0)

  return (
    <>
      <Cabecalho variante="escuro" />
      <Transicao>
        <main>
          <header className={estilos.cabecalho}>
            <div className={estilos.cabecalhoTexto}>
              <p className={estilos.kicker}>Vitrine</p>
              <h1 className={estilos.titulo}>À venda</h1>
              <p className={estilos.contagem}>
                {casas === 0
                  ? 'Nenhuma unidade à venda no momento.'
                  : `${casas} ${casas === 1 ? 'casa pronta' : 'casas prontas'} para morar, ${
                      imoveis.length === 1 ? 'em um condomínio' : `em ${imoveis.length} condomínios`
                    } da EGI.`}
              </p>
            </div>
          </header>

          {imoveis.length === 0 ? (
            <p className={estilos.vazio}>
              No momento não há imóveis à venda. Veja o{' '}
              <Link href="/empreendimentos">portfólio para locação</Link>.
            </p>
          ) : (
            imoveis.map((e) => <BlocoImovelAVenda key={e.id} imovel={e} nivelTitulo={2} />)
          )}
        </main>
      </Transicao>
      <Rodape />
    </>
  )
}
