import Image from 'next/image'
import estilos from './page.module.css'

export const metadata = { robots: { index: false, follow: false } }

// A gestão dos empreendimentos migrou para o CRM do grupo (20/08/2026).
// O site continua lendo os mesmos dados — agora do banco do CRM.
export default function PainelAposentado() {
  return (
    <main className={estilos.pagina}>
      <div className={estilos.caixa}>
        <Image
          src="/logo-egi.png"
          alt="E.G.I Empreendimentos"
          width={258}
          height={88}
          className={estilos.selo}
          priority
        />
        <h1 className={estilos.titulo}>O painel mudou de endereço</h1>
        <p style={{ margin: '0.75rem 0 0', lineHeight: 1.6 }}>
          Os empreendimentos agora são gerenciados no <strong>CRM do Grupo
          Almeida Andrade</strong>, no menu <strong>Empreendimentos</strong>.
          Tudo que for editado lá aparece neste site em até um minuto.
        </p>
      </div>
    </main>
  )
}
