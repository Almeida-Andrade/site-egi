'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import estilos from './Revelar.module.css'

export function Revelar({
  children,
  indice = 0,
  esticar = false,
  className,
}: {
  children: ReactNode
  indice?: number
  esticar?: boolean
  className?: string
}) {
  const alvo = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const elemento = alvo.current
    if (!elemento) return

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
