import Link from 'next/link'
import { criarClienteServidor } from '@/lib/supabase/server'
import { Sair } from '@/components/admin/Sair'
import estilos from './layout.module.css'

export const metadata = { title: 'Painel', robots: { index: false, follow: false } }

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const supabase = await criarClienteServidor()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Sem sessão só existe a tela de login, que se desenha sozinha.
  if (!user) return <>{children}</>

  return (
    <div className={estilos.moldura}>
      <header className={estilos.barra}>
        <Link href="/admin/empreendimentos" className={estilos.logo}>
          EGI · Painel
        </Link>
        <nav className={estilos.navegacao}>
          <Link href="/admin/empreendimentos">Empreendimentos</Link>
          <Link href="/" target="_blank" rel="noopener noreferrer">
            Ver site →
          </Link>
        </nav>
        <span className={estilos.usuario}>{user.email}</span>
        <Sair />
      </header>
      {children}
    </div>
  )
}
