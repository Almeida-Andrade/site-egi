import type { Metadata } from 'next'
import { Instrument_Serif, Archivo, Inter } from 'next/font/google'
import { Cortina } from '@/components/site/Cortina'
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

const DESCRICAO =
  'Galpões, salas comerciais, lojas e apartamentos para locação em São Luís e ' +
  'São José de Ribamar. Portfólio próprio administrado pela E.G.I Empreendimentos.'

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITE),
  title: {
    default: 'E.G.I Empreendimentos — Locação de imóveis próprios em São Luís',
    template: '%s · E.G.I Empreendimentos',
  },
  description: DESCRICAO,
  applicationName: 'E.G.I Empreendimentos',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'E.G.I Empreendimentos',
    title: 'E.G.I Empreendimentos — Locação de imóveis próprios em São Luís',
    description: DESCRICAO,
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'E.G.I Empreendimentos' }],
  },
  twitter: { card: 'summary_large_image' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${titulo.variable} ${corpo.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
        <Cortina />
        {children}
      </body>
    </html>
  )
}
