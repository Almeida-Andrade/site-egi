'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Imagem } from '@/lib/tipos'
import estilos from './Galeria.module.css'

export function Galeria({ imagens, nome }: { imagens: Imagem[]; nome: string }) {
  const [atual, setAtual] = useState(0)

  if (imagens.length === 0) {
    return <div className={estilos.semFoto}>{nome}</div>
  }

  return (
    <div>
      <div className={estilos.principal}>
        <Image
          src={imagens[atual].url}
          alt={imagens[atual].alt ?? nome}
          fill
          priority
          sizes="(max-width: 860px) 100vw, 60vw"
          style={{ objectFit: 'cover' }}
        />
      </div>

      {imagens.length > 1 && (
        <div className={estilos.miniaturas}>
          {imagens.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setAtual(i)}
              className={i === atual ? estilos.miniAtiva : estilos.mini}
              aria-label={`Foto ${i + 1} de ${imagens.length}`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="120px"
                style={{ objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
