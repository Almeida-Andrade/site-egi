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
  const marca = useRef<HTMLSpanElement>(null)
  const [sobre, setSobre] = useState<string | null>(null)
  const [posicao, setPosicao] = useState<{ x: number; largura: number } | null>(null)

  // O traço segue o item sob o cursor e volta ao da página ao sair.
  const alvo = sobre ?? ativo

  const medir = useCallback(() => {
    const item = alvo
      ? nav.current?.querySelector<HTMLElement>(`[data-href="${CSS.escape(alvo)}"]`)
      : null
    setPosicao(item ? { x: item.offsetLeft, largura: item.offsetWidth } : null)
  }, [alvo])

  useLayoutEffect(() => {
    medir()
  }, [medir])

  useEffect(() => {
    // As fontes chegam depois da primeira pintura e mudam a largura dos itens;
    // sem remedir, o traço fica deslocado até o próximo movimento do cursor.
    document.fonts?.ready.then(medir)

    const observador = new ResizeObserver(medir)
    if (nav.current) observador.observe(nav.current)
    return () => observador.disconnect()
  }, [medir])

  useEffect(() => {
    // O cabeçalho é remontado a cada navegação, então o traço nasce em x=0 —
    // que é justamente onde fica o primeiro item do menu. Animar a partir dali
    // faria parecer que ele sempre parte de "Início" para chegar ao destino.
    // A transição só entra depois do primeiro quadro: ao trocar de página o
    // traço aparece já no lugar, e o deslize fica reservado ao cursor.
    const quadro = requestAnimationFrame(() => {
      marca.current?.setAttribute('data-anima', 'true')
    })
    return () => cancelAnimationFrame(quadro)
  }, [])

  return (
    <nav
      className={estilos.navegacao}
      aria-label="Principal"
      ref={nav}
      onMouseLeave={() => setSobre(null)}
    >
      {ITENS_NAVEGACAO.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          data-href={item.href}
          data-ativo={ativo === item.href}
          aria-current={ativo === item.href ? 'page' : undefined}
          className={estilos.item}
          onMouseEnter={() => setSobre(item.href)}
          onFocus={() => setSobre(item.href)}
          onBlur={() => setSobre(null)}
        >
          {item.rotulo}
        </Link>
      ))}

      {/* Fora do fluxo e sem conteúdo: é decoração. Quem usa leitor de tela se
          orienta pelo aria-current, não por este traço. */}
      <span
        ref={marca}
        aria-hidden
        className={estilos.marca}
        data-visivel={posicao !== null}
        style={
          posicao
            ? { transform: `translateX(${posicao.x}px)`, width: `${posicao.largura}px` }
            : undefined
        }
      />
    </nav>
  )
}
