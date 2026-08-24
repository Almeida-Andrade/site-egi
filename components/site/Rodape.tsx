import Image from 'next/image'
import Link from 'next/link'
import { ITENS_NAVEGACAO } from '@/lib/navegacao'
import {
  IconeEmail,
  IconeFacebook,
  IconeInstagram,
  IconeWhatsApp, } from './Icones'
import estilos from './Rodape.module.css'

const REDES = [
  { nome: 'WhatsApp', href: 'https://wa.me/5598984812793', Icone: IconeWhatsApp },
  {
    nome: 'Instagram',
    href: 'https://www.instagram.com/egi.empreendimentos/',
    Icone: IconeInstagram,
  },
  {
    nome: 'Facebook',
    href: 'https://www.facebook.com/egiempreendimentos/',
    Icone: IconeFacebook,
  },
  {
    nome: 'E-mail',
    href: 'mailto:egiempreendimentos@grupoaandrade.com.br',
    Icone: IconeEmail,
  },
]

export function Rodape() {
  return (
    <footer className={estilos.rodape}>
      <div className={estilos.faixa}>
        <div>
          <Image
            src="/logo-egi-clara.png"
            alt="E.G.I Empreendimentos"
            width={246}
            height={84}
            className={estilos.logo}
          />
          <p className={estilos.lema}>Grandes empreendimentos começam com grandes sonhos.</p>
        </div>

        <div className={estilos.coluna}>
          <span className={estilos.rotulo}>Contato</span>

          <div className={estilos.redes}>
            {REDES.map((rede) => (
              <a
                key={rede.nome}
                className={estilos.rede}
                href={rede.href}
                aria-label={rede.nome}
                title={rede.nome}
                {...(rede.href.startsWith('http')
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                <rede.Icone className={estilos.icone} />
              </a>
            ))}
          </div>

          <span className={estilos.sede}>
            Av. dos Sambaquis, 33 — Ed. Galeria A
            <br />
            Calhau, São Luís — MA
          </span>
        </div>

        <div className={estilos.coluna}>
          <span className={estilos.rotulo}>Navegação</span>
          {/* Mesma lista do cabeçalho: escrita à mão aqui, o rodapé já ficou
              sem "Início" quando o menu mudou. */}
          {ITENS_NAVEGACAO.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.rotulo}
            </Link>
          ))}
        </div>
      </div>

      <div className={estilos.base}>
        <span>© {new Date().getFullYear()} E.G.I Empreendimentos</span>
      </div>
    </footer>
  )
}
