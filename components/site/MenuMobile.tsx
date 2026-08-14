'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ITENS_NAVEGACAO, itemAtivo } from '@/lib/navegacao'
import estilos from './MenuMobile.module.css'

export function MenuMobile({ whatsapp }: { whatsapp: string }) {
  const [aberto, setAberto] = useState(false)
  const caminho = usePathname()
  const ativo = itemAtivo(caminho)

  const botao = useRef<HTMLButtonElement>(null)
  const painel = useRef<HTMLDivElement>(null)

  // Fecha ao navegar — sem isto o painel fica por cima da página nova. O ajuste
  // acontece durante a renderização, não num efeito: assim o painel nunca chega
  // a ser pintado aberto sobre a rota nova. Vale também para o botão voltar,
  // que um `onClick` nos links não pegaria.
  const [caminhoAnterior, setCaminhoAnterior] = useState(caminho)
  if (caminho !== caminhoAnterior) {
    setCaminhoAnterior(caminho)
    setAberto(false)
  }

  useEffect(() => {
    if (!aberto) return

    const gatilho = botao.current

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false)
    }
    document.addEventListener('keydown', aoTeclar)

    // Trava a rolagem do fundo enquanto o painel cobre a tela.
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    painel.current?.querySelector<HTMLElement>('a')?.focus()

    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = overflowAnterior
      gatilho?.focus()
    }
  }, [aberto])

  return (
    <>
      <button
        ref={botao}
        type="button"
        className={estilos.botao}
        aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={aberto}
        aria-controls="menu-mobile"
        onClick={() => setAberto((a) => !a)}
      >
        <span className={estilos.risco} data-aberto={aberto} />
        <span className={estilos.risco} data-aberto={aberto} />
      </button>

      <div
        id="menu-mobile"
        ref={painel}
        className={estilos.painel}
        data-aberto={aberto}
        // `inert` tira do foco e da árvore de acessibilidade quando fechado,
        // então o painel não é alcançável por Tab atrás da página.
        inert={!aberto}
      >
        {/* O painel cobre o cabeçalho inteiro; sem isto o visitante perde a
            marca de vista enquanto o menu está aberto. */}
        <Image
          src="/logo-egi-clara.png"
          alt=""
          width={1608}
          height={549}
          className={estilos.logo}
          aria-hidden
        />

        <nav className={estilos.lista} aria-label="Principal">
          {ITENS_NAVEGACAO.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo === item.href ? 'page' : undefined}
              data-ativo={ativo === item.href}
              className={estilos.item}
            >
              {item.rotulo}
            </Link>
          ))}
        </nav>

        <a
          className={estilos.acao}
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
        >
          Falar no WhatsApp
        </a>
      </div>
    </>
  )
}
