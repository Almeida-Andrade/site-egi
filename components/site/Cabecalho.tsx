import Image from 'next/image'
import Link from 'next/link'
import { NavegacaoPrincipal } from './NavegacaoPrincipal'
import { MenuMobile } from './MenuMobile'
import estilos from './Cabecalho.module.css'

const WHATSAPP = 'https://wa.me/5598984812793'

const variantesEstilos: Record<'claro' | 'escuro', string> = {
  claro: '',
  escuro: estilos.escuro,
}

const variantesLogo: Record<'claro' | 'escuro', string> = {
  claro: '/logo-egi.png',
  escuro: '/logo-egi-clara.png',
}

export function Cabecalho({ variante = 'claro' }: { variante?: 'claro' | 'escuro' }) {
  return (
    <header
      className={[
        estilos.cabecalho,
        variantesEstilos[variante],
        variante === 'escuro' ? 'cabecalho-escuro' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ viewTransitionName: 'site-header' }}
    >
      <Link href="/" className={estilos.marca}>
        <Image
          src={variantesLogo[variante]}
          alt="E.G.I Empreendimentos"
          width={270}
          height={92}
          className={estilos.logo}
          priority
        />
      </Link>

      <NavegacaoPrincipal />

      <a className={estilos.acao} href={WHATSAPP} target="_blank" rel="noopener noreferrer">
        WhatsApp
      </a>

      <MenuMobile whatsapp={WHATSAPP} />
    </header>
  )
}
