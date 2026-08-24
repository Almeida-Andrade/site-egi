'use server'

import { revalidatePath } from 'next/cache'

export async function revalidarSite(slug?: string) {
  revalidatePath('/')
  revalidatePath('/empreendimentos')
  revalidatePath('/sobre')
  if (slug) revalidatePath(`/empreendimentos/${slug}`)
}
