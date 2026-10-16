import { NextResponse, type NextRequest } from 'next/server'
import { atualizarSessao } from '@/lib/supabase/middleware'
import { CABECALHOS_DA_FICHA, hashesDosScripts, politicaDaFicha } from '@/lib/ficha/seguranca'
import { SCRIPTS_INICIAIS } from '@/lib/scripts-iniciais'

let hashes: Promise<string[]> | null = null

async function protegerFicha(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID())
  hashes ??= hashesDosScripts(SCRIPTS_INICIAIS)
  const politica = politicaDaFicha(nonce, process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NODE_ENV !== 'production', await hashes)
  // O Next lê o nonce do cabeçalho do pedido e o põe nos próprios scripts.
  const pedido = new Headers(request.headers)
  pedido.set('x-nonce', nonce)
  pedido.set('Content-Security-Policy', politica)
  const resposta = NextResponse.next({ request: { headers: pedido } })
  resposta.headers.set('Content-Security-Policy', politica)
  for (const [nome, valor] of Object.entries(CABECALHOS_DA_FICHA)) resposta.headers.set(nome, valor)
  return resposta
}

export async function middleware(request: NextRequest) {
  const caminho = request.nextUrl.pathname
  if (caminho === '/ficha' || caminho.startsWith('/ficha/')) return protegerFicha(request)
  return atualizarSessao(request)
}

export const config = {
  matcher: ['/admin/:path*', '/ficha', '/ficha/:path*'],
}
