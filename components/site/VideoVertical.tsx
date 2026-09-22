'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import estilos from './VideoVertical.module.css'

const CONSULTA = '(prefers-reduced-motion: reduce)'

function assinarMovimento(avisar: () => void) {
  const mq = window.matchMedia(CONSULTA)
  mq.addEventListener('change', avisar)
  return () => mq.removeEventListener('change', avisar)
}

/**
 * Vídeo em pé (formato de reels) numa moldura de celular. Toca mudo, em
 * loop, só enquanto está na tela; o toque liga o som. Com movimento reduzido
 * não há autoplay: aparece parado, com os controles do navegador.
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
  const [mudo, setMudo] = useState(true)
  const reduzido = useSyncExternalStore(
    assinarMovimento,
    () => window.matchMedia(CONSULTA).matches,
    () => false,
  )

  useEffect(() => {
    const el = video.current
    if (!el || reduzido) return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) void el.play().catch(() => {})
        else el.pause()
      },
      { threshold: 0.5 },
    )
    observador.observe(el)
    return () => observador.disconnect()
  }, [reduzido])

  function alternarSom() {
    const el = video.current
    if (!el) return
    el.muted = !el.muted
    setMudo(el.muted)
    if (el.paused) void el.play().catch(() => {})
  }

  return (
    <figure className={[estilos.moldura, compacto && estilos.compacto].filter(Boolean).join(' ')}>
      <video
        ref={video}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        controls={reduzido}
        aria-label={titulo}
        className={estilos.video}
        onClick={reduzido ? undefined : alternarSom}
      />
      {!reduzido && (
        <button
          type="button"
          onClick={alternarSom}
          className={estilos.som}
          aria-pressed={!mudo}
        >
          {mudo ? 'Ativar som' : 'Silenciar'}
        </button>
      )}
    </figure>
  )
}
