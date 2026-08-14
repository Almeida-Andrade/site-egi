'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import estilos from './Revelar.module.css'

/**
 * Revela o conteúdo quando ele entra na tela: sobe alguns pixels e ganha
 * opacidade. Acontece uma vez só — reanimar ao subir de volta transforma a
 * rolagem em um piscar constante.
 *
 * `indice` escalona a entrada dos itens de uma grade. O teto de 6 evita que o
 * último cartão de uma lista longa demore quase um segundo para aparecer.
 */
export function Revelar({
  children,
  indice = 0,
  esticar = false,
  className,
}: {
  children: ReactNode
  indice?: number
  /**
   * Numa grade este invólucro passa a ser o item, e o filho deixaria de esticar
   * até a altura da linha — cartões lado a lado ficariam com o rodapé
   * desalinhado. Ligue para devolver o esticamento ao filho.
   */
  esticar?: boolean
  className?: string
}) {
  const alvo = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const elemento = alvo.current
    if (!elemento) return

    // Sem JavaScript ou com movimento reduzido o conteúdo já nasce visível pelo
    // CSS; aqui só evitamos registrar um observador que nada faria.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elemento.dataset.visivel = 'true'
      return
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return
        elemento.dataset.visivel = 'true'
        observador.disconnect()
      },
      // Dispara um pouco antes da borda inferior para o movimento terminar
      // enquanto o elemento ainda sobe.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    )

    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  return (
    <div
      ref={alvo}
      className={[estilos.revelar, esticar && estilos.esticar, className]
        .filter(Boolean)
        .join(' ')}
      style={{ '--atraso': `${Math.min(indice, 6) * 70}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
