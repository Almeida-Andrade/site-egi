import { Cabecalho } from '@/components/site/Cabecalho'
import { Rodape } from '@/components/site/Rodape'
import estilos from './page.module.css'

export const metadata = {
  title: 'Contato',
  description: 'Fale com a E.G.I Empreendimentos por telefone ou WhatsApp.',
}

export default function Contato() {
  return (
    <>
      <Cabecalho />
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

          <a className={estilos.canal} href="tel:+559832355008">
            <span className={estilos.rotulo}>Telefone</span>
            <b>(98) 3235-5008</b>
            <span className={estilos.dica}>Horário comercial</span>
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
        </div>
      </main>
      <Rodape />
    </>
  )
}
