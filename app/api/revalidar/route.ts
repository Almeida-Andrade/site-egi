import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'

// Chamada pelo CRM (lib/revalidar-site.ts) quando empreendimentos/unidades/
// fotos mudam lá: o ISR de 60s cobre sem isso, mas com o aviso o site
// reflete na hora. Secret compartilhado via header x-revalidar-secret.
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDAR_SECRET
  if (!secret || request.headers.get('x-revalidar-secret') !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  let slug: string | undefined
  try {
    const corpo = (await request.json()) as { slug?: string }
    if (typeof corpo.slug === 'string' && corpo.slug) slug = corpo.slug
  } catch {
    // corpo vazio = revalidar tudo
  }

  revalidatePath('/')
  revalidatePath('/empreendimentos')
  if (slug) revalidatePath(`/empreendimentos/${slug}`)
  else revalidatePath('/empreendimentos/[slug]', 'page')

  return NextResponse.json({ ok: true, slug: slug ?? null })
}
