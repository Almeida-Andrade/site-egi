import type { Metadata } from 'next'
import { Cabecalho } from '@/components/site/Cabecalho'
import { Rodape } from '@/components/site/Rodape'
import { FormularioFicha } from '@/components/ficha/FormularioFicha'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ficha cadastral',
  description: 'Ficha cadastral para alugar uma unidade da E.G.I Empreendimentos.',
  robots: { index: false, follow: false },
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

export default async function FichaPelaVaga({ searchParams }: { searchParams: Promise<{ unidade?: string }> }) {
  const { unidade } = await searchParams
  const unidadeId = typeof unidade === 'string' && UUID.test(unidade) ? unidade : ''
  return (
    <>
      <Cabecalho />
      <FormularioFicha alvo={{ unidadeId }} />
      <Rodape />
    </>
  )
}
