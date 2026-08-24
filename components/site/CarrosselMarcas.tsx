import { MARCAS } from '@/lib/conteudo'
import estilos from './CarrosselMarcas.module.css'

const ALTURA = 40

export function CarrosselMarcas() {
  const fita = (escondida: boolean) => (
    <ul className={estilos.fita} aria-hidden={escondida || undefined}>
      {MARCAS.map((m) => (
        <li key={m.nome} className={estilos.item}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={m.arquivo}
            alt={escondida ? '' : m.nome}
            height={ALTURA}
            width={Math.round(ALTURA * m.proporcao)}
            loading="lazy"
            decoding="async"
          />
        </li>
      ))}
    </ul>
  )

  return (
    <div className={estilos.trilho}>
      <div className={estilos.faixa}>
        {fita(false)}
        {fita(true)}
      </div>
    </div>
  )
}
