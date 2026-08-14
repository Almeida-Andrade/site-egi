import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function criarClienteServidor() {
  const armazem = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return armazem.getAll()
        },
        setAll(lista) {
          try {
            for (const { name, value, options } of lista) {
              armazem.set(name, value, options)
            }
          } catch {
            // Server Component não pode escrever cookie; o middleware cuida disso
          }
        },
      },
    },
  )
}
