import Image from 'next/image'
import Link from 'next/link'
import type { EmpreendimentoResumo } from '@/lib/tipos'
import { rotuloTipoEmpreendimento, urlImagem } from '@/lib/utils/rotulos'
import estilos from './CardEmpreendimento.module.css'

export function CardEmpreendimento({ empreendimento: e }: { empreendimento: EmpreendimentoResumo }) {
  return (
    <Link href={`/empreendimentos/${e.slug}`} className={estilos.card}>
      <div className={estilos.foto}>
        {e.capa ? (
          <Image
            src={urlImagem(e.capa.storage_path)}
            alt={e.capa.alt ?? e.nome}
            fill
            sizes="(max-width: 860px) 100vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className={estilos.semFoto}>{e.nome}</div>
        )}
        {e.disponiveis > 0 && (
          <span className={estilos.selo}>
            {e.disponiveis} {e.disponiveis === 1 ? 'disponível' : 'disponíveis'}
          </span>
        )}
      </div>

      <div className={estilos.corpo}>
        <span className={estilos.tipo}>{rotuloTipoEmpreendimento(e.tipo)}</span>
        <h3 className={estilos.nome}>{e.nome}</h3>
        <p className={estilos.local}>
          {e.bairro ? `${e.bairro} · ` : ''}
          {e.cidade}
        </p>
        <p className={estilos.contagem}>
          {e.total_unidades} {e.total_unidades === 1 ? 'unidade' : 'unidades'}
        </p>
      </div>
    </Link>
  )
}
