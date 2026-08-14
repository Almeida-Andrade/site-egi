import { MARCAS } from '@/lib/conteudo'
import estilos from './CarrosselMarcas.module.css'

const ALTURA = 40

/**
 * Fita de logotipos em movimento contínuo.
 *
 * A lista é renderizada duas vezes e a faixa desliza até -50%: quando a primeira
 * cópia sai de cena a segunda está exatamente onde a primeira começou, e o
 * reinício não tem emenda visível. A cópia é `aria-hidden` para o leitor de tela
 * não anunciar cada marca duas vezes.
 *
 * É CSS puro, sem estado nem JavaScript — por isso o componente continua sendo
 * de servidor. Para quem pediu movimento reduzido, a fita vira uma grade parada.
 */
export function CarrosselMarcas() {
  const fita = (escondida: boolean) => (
    <ul className={estilos.fita} aria-hidden={escondida || undefined}>
      {MARCAS.map((m) => (
        <li key={m.nome} className={estilos.item}>
          {/* <img> comum, não next/image: quatro dos nove logos são SVG, que o
              otimizador repassa intacto, e os outros já saem daqui com no máximo
              200 px de altura. Nada a otimizar, e um passo a menos no build. */}
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
