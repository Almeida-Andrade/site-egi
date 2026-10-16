import type { Metadata } from 'next'
import { Cabecalho } from '@/components/site/Cabecalho'
import { Rodape } from '@/components/site/Rodape'
import { FormularioFicha } from '@/components/ficha/FormularioFicha'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ficha cadastral',
  description: 'Ficha cadastral para alugar uma unidade da E.G.I Empreendimentos.',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default async function FichaPeloLink({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  // O token vai só ao servidor da ficha, que confere o hash; formato estranho cai em "link não vale".
  return (
    <>
      <Cabecalho />
      <FormularioFicha alvo={{ token: /^[A-Za-z0-9_-]{43}$/.test(token) ? token : 'invalido' }} />
      <Rodape />
    </>
  )
}
