import Link from 'next/link'
import estilos from './Cabecalho.module.css'

export function Cabecalho({ variante = 'claro' }: { variante?: 'claro' | 'escuro' }) {
  return (
    <header className={`${estilos.cabecalho} ${estilos[variante]}`}>
      <Link href="/" className={estilos.logo}>
        EGI
        <span>EMPREENDIMENTOS</span>
      </Link>

      <nav className={estilos.navegacao} aria-label="Principal">
        <Link href="/empreendimentos">Empreendimentos</Link>
        <Link href="/empreendimentos?disponiveis=1">Disponíveis</Link>
        <Link href="/sobre">A EGI</Link>
        <Link href="/contato">Contato</Link>
      </nav>

      <a
        className={estilos.acao}
        href="https://wa.me/5598984812793"
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp
      </a>
    </header>
  )
}
