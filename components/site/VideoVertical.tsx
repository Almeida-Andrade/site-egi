'use client'

import { useEffect, useRef } from 'react'
import estilos from './VideoVertical.module.css'

/**
 * Vídeo em pé (formato de reels) numa moldura de celular. Toca mudo, em
 * loop, só enquanto está na tela; os controles nativos ficam sempre à mão
 * para ligar o som, pausar ou abrir em tela cheia. Não depende de
 * prefers-reduced-motion: há máquina que reporta o ajuste sem a pessoa ter
 * pedido, e um vídeo parado ali parece quebrado.
 */
export function VideoVertical({
  src,
  poster,
  titulo,
  compacto = false,
}: {
  src: string
  poster?: string
  titulo: string
  compacto?: boolean
}) {
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = video.current
    if (!el) return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) void el.play().catch(() => {})
        else el.pause()
      },
      { threshold: 0.5 },
    )
    observador.observe(el)
    return () => observador.disconnect()
  }, [])

  return (
    <figure className={[estilos.moldura, compacto && estilos.compacto].filter(Boolean).join(' ')}>
      <video
        ref={video}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        controls
        preload="metadata"
        aria-label={titulo}
        className={estilos.video}
      />
    </figure>
  )
}
