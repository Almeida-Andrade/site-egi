'use server'

import { revalidatePath } from 'next/cache'

/**
 * Chamada pelo painel depois de salvar. Sem isso, as páginas estáticas só
 * atualizariam quando o ISR expirasse — o operador marcaria uma sala como
 * alugada e continuaria vendo "disponível" no site.
 */
export async function revalidarSite(slug?: string) {
  revalidatePath('/')
  revalidatePath('/empreendimentos')
  revalidatePath('/sobre')
  if (slug) revalidatePath(`/empreendimentos/${slug}`)
}
