import Image from 'next/image'
import Link from 'next/link'
import estilos from './Cabecalho.module.css'

const variantesEstilos: Record<'claro' | 'escuro', string> = {
  claro: '',
  escuro: estilos.escuro,
}

export function Cabecalho({ variante = 'claro' }: { variante?: 'claro' | 'escuro' }) {
  return (
    <header className={`${estilos.cabecalho} ${variantesEstilos[variante]}`.trim()}>
      <Link href="/" className={estilos.marca} aria-label="E.G.I Empreendimentos — início">
        <Image
          src="/logo-egi.png"
          alt=""
          width={40}
          height={40}
          className={estilos.selo}
          priority
        />
        <span className={estilos.logo} aria-hidden="true">
          EGI
          <span>EMPREENDIMENTOS</span>
        </span>
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
