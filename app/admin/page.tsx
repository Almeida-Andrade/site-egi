'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { criarClienteNavegador } from '@/lib/supabase/client'
import estilos from './page.module.css'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault()
    setEnviando(true)
    setErro(null)

    const supabase = criarClienteNavegador()
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error) {
      // Mensagem genérica de propósito: distinguir "e-mail não existe" de
      // "senha errada" entregaria a lista de e-mails válidos a quem tentasse.
      setErro('E-mail ou senha incorretos.')
      setEnviando(false)
      return
    }

    router.push('/admin/empreendimentos')
    router.refresh()
  }

  return (
    <main className={estilos.pagina}>
      <form className={estilos.caixa} onSubmit={entrar}>
        <Image
          src="/logo-egi.png"
          alt="E.G.I Empreendimentos"
          width={1608}
          height={549}
          className={estilos.selo}
          priority
        />
        <h1 className={estilos.titulo}>Painel administrativo</h1>

        <label className={estilos.campo}>
          <span>E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </label>

        <label className={estilos.campo}>
          <span>Senha</span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        {erro && <p className={estilos.erro}>{erro}</p>}

        <button className={estilos.botao} type="submit" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
