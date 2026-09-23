'use client'

import { useEffect, useRef, useState } from 'react'
import estilos from './VideoVertical.module.css'

/**
 * Vídeo em pé (formato de reels) numa moldura de celular. Toca só enquanto
 * está na tela, com os controles nativos sempre à mão. Não depende de
 * prefers-reduced-motion: há máquina que reporta o ajuste sem a pessoa ter
 * pedido, e um vídeo parado ali parece quebrado.
 *
 * O navegador só deixa o som começar sozinho depois de um toque na página
 * (rolar não conta). Sem esse toque o vídeo entra mudo e o aviso "Toque para
 * ouvir" fica em cima dele; depois do toque, entra com som.
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

  useEffect(() => {
    const el = video.current
    if (!el) return
    const tocar = async () => {
      if (navigator.userActivation?.hasBeenActive) {
        el.muted = false
        try {
          await el.play()
          return
        } catch {
          el.muted = true
        }
      }
      await el.play().catch(() => {})
    }
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) void tocar()
        else el.pause()
      },
      { threshold: 0.5 },
    )
    const acompanhar = () => setMudo(el.muted || el.volume === 0)
    el.addEventListener('volumechange', acompanhar)
    observador.observe(el)
    return () => {
      observador.disconnect()
      el.removeEventListener('volumechange', acompanhar)
    }
  }, [])

  function ligarSom() {
    const el = video.current
    if (!el) return
    el.muted = false
    if (el.volume === 0) el.volume = 1
    el.currentTime = 0
    void el.play().catch(() => {})
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
        controls
        preload="metadata"
        aria-label={titulo}
        className={estilos.video}
      />
      {mudo && (
        <button type="button" onClick={ligarSom} className={estilos.som}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4V5z" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M19 5a10 10 0 0 1 0 14" />
          </svg>
          Toque para ouvir
        </button>
      )}
    </figure>
  )
}
