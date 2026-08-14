import Image from 'next/image'
import Link from 'next/link'
import estilos from './Cabecalho.module.css'

const variantesEstilos: Record<'claro' | 'escuro', string> = {
  claro: '',
  escuro: estilos.escuro,
}

// O letreiro da logo é navy; sobre o cabeçalho escuro ele sumiria, por isso a
// variante clara traz o mesmo lockup com o texto em off-white.
const variantesLogo: Record<'claro' | 'escuro', string> = {
  claro: '/logo-egi.png',
  escuro: '/logo-egi-clara.png',
}

export function Cabecalho({ variante = 'claro' }: { variante?: 'claro' | 'escuro' }) {
  return (
    <header className={`${estilos.cabecalho} ${variantesEstilos[variante]}`.trim()}>
      <Link href="/" className={estilos.marca}>
        <Image
          src={variantesLogo[variante]}
          alt="E.G.I Empreendimentos"
          width={1608}
          height={549}
          className={estilos.logo}
          priority
        />
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
