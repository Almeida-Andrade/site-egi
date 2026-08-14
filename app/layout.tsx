import type { Metadata } from 'next'
import { Instrument_Serif, Archivo, Inter } from 'next/font/google'
import { URL_SITE } from '@/lib/site'
import './globals.css'

const display = Instrument_Serif({
  subsets: ['latin'], weight: '400', variable: '--fonte-display', display: 'swap',
})
const titulo = Archivo({
  subsets: ['latin'], variable: '--fonte-titulo', display: 'swap',
})
const corpo = Inter({
  subsets: ['latin'], variable: '--fonte-corpo', display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITE),
  title: {
    default: 'E.G.I Empreendimentos — Locação de imóveis próprios em São Luís',
    template: '%s · E.G.I Empreendimentos',
  },
  description:
    'Galpões, salas comerciais, lojas e apartamentos para locação em São Luís e ' +
    'São José de Ribamar. Portfólio próprio administrado pela E.G.I Empreendimentos.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${titulo.variable} ${corpo.variable}`}>
      <body>{children}</body>
    </html>
  )
}
