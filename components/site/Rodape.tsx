import Link from 'next/link'
import estilos from './Rodape.module.css'

export function Rodape() {
  return (
    <footer className={estilos.rodape}>
      <div className={estilos.faixa}>
        <div>
          <div className={estilos.logo}>EGI EMPREENDIMENTOS</div>
          <p className={estilos.lema}>Grandes empreendimentos começam com grandes sonhos.</p>
        </div>

        <div className={estilos.coluna}>
          <span className={estilos.rotulo}>Contato</span>
          <a href="tel:+559832355008">(98) 3235-5008</a>
          <a href="https://wa.me/5598984812793" target="_blank" rel="noopener noreferrer">
            WhatsApp (98) 98481-2793
          </a>
        </div>

        <div className={estilos.coluna}>
          <span className={estilos.rotulo}>Navegação</span>
          <Link href="/empreendimentos">Empreendimentos</Link>
          <Link href="/sobre">A EGI</Link>
          <Link href="/contato">Contato</Link>
        </div>
      </div>

      <div className={estilos.base}>
        <span>© {new Date().getFullYear()} E.G.I Empreendimentos</span>
        <span>São Luís · Maranhão</span>
      </div>
    </footer>
  )
}
