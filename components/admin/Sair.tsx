'use client'

import { useRouter } from 'next/navigation'
import { criarClienteNavegador } from '@/lib/supabase/client'
import estilos from './Sair.module.css'

export function Sair() {
  const router = useRouter()

  async function sair() {
    const supabase = criarClienteNavegador()
    await supabase.auth.signOut()
    router.push('/admin')
    router.refresh()
  }

  return (
    <button type="button" className={estilos.botao} onClick={sair}>
      Sair
    </button>
  )
}
