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
  // Sem `alternates` aqui: uma canônica no layout seria herdada por toda página
  // que não a sobrescreve, apontando o site inteiro para a home. Cada rota
  // declara a sua.
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
      // O portfólio se vende pela foto: sem isto o Google corta a miniatura.
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${titulo.variable} ${corpo.variable}`}>
      <body>
        {/* Marca que há JavaScript antes do corpo ser pintado. As animações de
            entrada partem de opacidade zero: sem esta classe, um script que
            falhasse deixaria a página em branco para sempre. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
        {children}
      </body>
    </html>
  )
}
