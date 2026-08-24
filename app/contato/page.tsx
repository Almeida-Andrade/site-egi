import type { Metadata } from 'next'
import Link from 'next/link'
import { Cabecalho } from '@/components/site/Cabecalho'
import { Rodape } from '@/components/site/Rodape'
import { Transicao } from '@/components/site/Transicao'
import estilos from './page.module.css'

const DESCRICAO =
  'Fale com a E.G.I Empreendimentos por WhatsApp, telefone ou e-mail. ' +
  'Sede na Av. dos Sambaquis, 33 — Ed. Galeria A, Calhau, São Luís (MA).'

export const metadata: Metadata = {
  title: 'Contato',
  description: DESCRICAO,
  alternates: { canonical: '/contato' },
  openGraph: { url: '/contato', title: 'Contato', description: DESCRICAO },
}

export default function Contato() {
  return (
    <>
      <Cabecalho />
      <Transicao>
        <main className={estilos.pagina}>
          <p className={estilos.kicker}>Contato</p>
          <h1 className={estilos.titulo}>Vamos conversar sobre o seu espaço.</h1>

          <div className={estilos.canais}>
            <a
              className={estilos.canal}
              href="https://wa.me/5598984812793"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={estilos.rotulo}>WhatsApp</span>
              <b>(98) 98481-2793</b>
              <span className={estilos.dica}>Resposta mais rápida</span>
            </a>

            <a
              className={estilos.canal}
              href="https://www.instagram.com/egi.empreendimentos/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={estilos.rotulo}>Instagram</span>
              <b>@egi.empreendimentos</b>
              <span className={estilos.dica}>Novidades e lançamentos</span>
            </a>

            <a className={estilos.canal} href="mailto:egiempreendimentos@grupoaandrade.com.br">
              <span className={estilos.rotulo}>E-mail</span>
              <b className={estilos.valorLongo}>egiempreendimentos@grupoaandrade.com.br</b>
              <span className={estilos.dica}>Para propostas e documentos</span>
            </a>
          </div>

          <div className={estilos.sede}>
            <span className={estilos.rotulo}>Sede</span>
            <address>
              Av. dos Sambaquis, 33 — Ed. Galeria A
              <br />
              Calhau, São Luís — MA
            </address>
            <Link href="/empreendimentos/centro-comercial-empresarial-galeria-a">
              Conheça a Galeria A →
            </Link>
          </div>
        </main>
      </Transicao>
      <Rodape />
    </>
  )
}
