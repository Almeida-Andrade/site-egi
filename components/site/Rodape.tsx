import Image from 'next/image'
import Link from 'next/link'
import estilos from './Rodape.module.css'

/**
 * `colado` remove o respiro acima do rodapé. Serve quando a seção anterior já é
 * navy — na home, a faixa de chamada — porque aí o respiro apareceria como uma
 * tira clara entre dois blocos escuros.
 */
export function Rodape({ colado = false }: { colado?: boolean } = {}) {
  return (
    <footer className={`${estilos.rodape} ${colado ? estilos.colado : ''}`.trim()}>
      <div className={estilos.faixa}>
        <div>
          <Image
            src="/logo-egi-clara.png"
            alt="E.G.I Empreendimentos"
            width={1608}
            height={549}
            className={estilos.logo}
          />
          <p className={estilos.lema}>Grandes empreendimentos começam com grandes sonhos.</p>
        </div>

        <div className={estilos.coluna}>
          <span className={estilos.rotulo}>Contato</span>
          <a href="tel:+559832355008">(98) 3235-5008</a>
          <a href="https://wa.me/5598984812793" target="_blank" rel="noopener noreferrer">
            WhatsApp (98) 98481-2793
          </a>
          <a href="mailto:egiempreendimentos@grupoalmeidaandrade.com.br">
            egiempreendimentos@grupoalmeidaandrade.com.br
          </a>
          <span className={estilos.sede}>
            Av. dos Sambaquis, 34 — Ed. Galeria A
            <br />
            Calhau, São Luís — MA
          </span>
        </div>

        <div className={estilos.coluna}>
          <span className={estilos.rotulo}>Navegação</span>
          <Link href="/empreendimentos">Empreendimentos</Link>
          <Link href="/sobre">A EGI</Link>
          <Link href="/contato">Contato</Link>
        </div>
      </div>

      <div className={estilos.base}>
        <span>© {new Date().getFullYear()} E.G.I Empreendimentos</span>
        <span>São Luís · Maranhão</span>
      </div>
    </footer>
  )
}
