'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ITENS_NAVEGACAO, itemAtivo } from '@/lib/navegacao'
import estilos from './NavegacaoPrincipal.module.css'

export function NavegacaoPrincipal() {
  const caminho = usePathname()
  const ativo = itemAtivo(caminho)

  const nav = useRef<HTMLElement>(null)
  const [marca, setMarca] = useState<{ x: number; largura: number } | null>(null)

  const medir = useCallback(() => {
    const alvo = nav.current?.querySelector<HTMLElement>('[data-ativo="true"]')
    if (!alvo || !nav.current) {
      setMarca(null)
      return
    }
    setMarca({ x: alvo.offsetLeft, largura: alvo.offsetWidth })
  }, [])

  useLayoutEffect(() => {
    medir()
  }, [medir, ativo])

  useEffect(() => {
    // As fontes chegam depois da primeira pintura e mudam a largura dos itens;
    // sem remedir, o indicador fica deslocado até o próximo clique.
    document.fonts?.ready.then(medir)

    const observador = new ResizeObserver(medir)
    if (nav.current) observador.observe(nav.current)
    return () => observador.disconnect()
  }, [medir])

  return (
    <nav className={estilos.navegacao} aria-label="Principal" ref={nav}>
      {ITENS_NAVEGACAO.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          data-ativo={ativo === item.href}
          aria-current={ativo === item.href ? 'page' : undefined}
          className={estilos.item}
        >
          {item.rotulo}
        </Link>
      ))}

      {/* Fora do fluxo e sem conteúdo: é decoração. Quem usa leitor de tela se
          orienta pelo aria-current, não por este traço. */}
      <span
        aria-hidden
        className={estilos.marca}
        data-visivel={marca !== null}
        style={
          marca
            ? { transform: `translateX(${marca.x}px)`, width: `${marca.largura}px` }
            : undefined
        }
      />
    </nav>
  )
}
