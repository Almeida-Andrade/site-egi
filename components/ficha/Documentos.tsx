'use client'

import { useId, useRef, useState } from 'react'
import { MAX_ARQUIVOS_POR_DOCUMENTO, MAX_BYTES_ARQUIVO, type DocumentoExigido } from '@/lib/ficha-cadastral'
import { prepararArquivo } from '@/lib/ficha/envio'
import estilos from './Ficha.module.css'

export type ArquivosPorDocumento = Record<string, File[]>

function tamanho(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}

function Documento({
  doc,
  arquivos,
  adicionar,
  tirar,
  erro,
}: {
  doc: DocumentoExigido
  arquivos: File[]
  adicionar: (novos: File[]) => void
  tirar: (indice: number) => void
  erro?: string
}) {
  const id = useId()
  const foto = useRef<HTMLInputElement>(null)
  const arquivo = useRef<HTMLInputElement>(null)
  const [ajuda, setAjuda] = useState(false)
  const [problema, setProblema] = useState<string | null>(null)
  const [preparando, setPreparando] = useState(false)

  async function receber(lista: FileList | null) {
    if (!lista?.length) return
    setProblema(null)
    setPreparando(true)
    const novos: File[] = []
    for (const f of Array.from(lista)) {
      if (arquivos.length + novos.length >= MAX_ARQUIVOS_POR_DOCUMENTO) {
        setProblema(`No máximo ${MAX_ARQUIVOS_POR_DOCUMENTO} arquivos para este documento.`)
        break
      }
      const aceito = f.type === 'application/pdf' || f.type.startsWith('image/')
      if (!aceito) {
        setProblema('Só vale foto ou PDF.')
        continue
      }
      try {
        const pronto = await prepararArquivo(f)
        if (pronto.size > MAX_BYTES_ARQUIVO) setProblema('Este arquivo passa de 10 MB. Tire uma foto ou reduza o PDF.')
        else novos.push(pronto)
      } catch (e) {
        setProblema(e instanceof Error ? e.message : 'Não conseguimos abrir este arquivo.')
      }
    }
    setPreparando(false)
    if (novos.length) adicionar(novos)
  }

  const enviado = arquivos.length > 0
  return (
    <div className={estilos.documento}>
      <div className={estilos.documentoTopo}>
        <div className={estilos.rotuloLinha}>
          <span className={estilos.documentoNome} id={`${id}-nome`}>
            {doc.rotulo}
          </span>
          <button type="button" className={estilos.botaoAjuda} aria-expanded={ajuda} aria-controls={`${id}-ajuda`} onClick={() => setAjuda(!ajuda)}>
            <span aria-hidden="true">?</span>
            <span className="sr-only">O que serve como {doc.rotulo}</span>
          </button>
        </div>
        <span className={`${estilos.selo} ${enviado ? estilos.seloOk : ''}`}>{enviado ? 'Pronto' : doc.obrigatorio ? 'Obrigatório' : 'Opcional'}</span>
      </div>
      {ajuda && (
        <p id={`${id}-ajuda`} className={estilos.painelAjuda}>
          {doc.ajuda}
        </p>
      )}
      {enviado && (
        <ul className={estilos.arquivos} aria-labelledby={`${id}-nome`}>
          {arquivos.map((f, i) => (
            <li key={`${f.name}-${i}`} className={estilos.arquivo}>
              <span>
                {f.name} · {tamanho(f.size)}
              </span>
              <button type="button" className={estilos.botaoTexto} onClick={() => tirar(i)}>
                Tirar
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className={estilos.botoesArquivo}>
        <button type="button" className={estilos.botaoSecundario} onClick={() => foto.current?.click()} disabled={preparando}>
          {enviado ? 'Tirar mais uma foto' : 'Tirar foto'}
        </button>
        <button type="button" className={estilos.botaoSecundario} onClick={() => arquivo.current?.click()} disabled={preparando}>
          Escolher arquivo
        </button>
        <input ref={foto} className={estilos.escondido} type="file" accept="image/*" capture="environment" tabIndex={-1} aria-hidden="true" onChange={(e) => { void receber(e.target.files); e.target.value = '' }} />
        <input ref={arquivo} className={estilos.escondido} type="file" accept="application/pdf,image/jpeg,image/png,image/*" multiple tabIndex={-1} aria-hidden="true" onChange={(e) => { void receber(e.target.files); e.target.value = '' }} />
      </div>
      {preparando && <span className={estilos.opcional}>Preparando o arquivo…</span>}
      {(problema || erro) && (
        <span className={estilos.mensagemErro} role="alert">
          {problema || erro}
        </span>
      )}
    </div>
  )
}

export function EtapaDocumentos({
  exigidos,
  arquivos,
  aoMudar,
  erros,
}: {
  exigidos: DocumentoExigido[]
  arquivos: ArquivosPorDocumento
  aoMudar: (atualizar: (a: ArquivosPorDocumento) => ArquivosPorDocumento) => void
  erros: Record<string, string>
}) {
  // A foto demora mais que o PDF para ficar pronta: cada mudança parte da lista de agora, nunca da de quando começou.
  return (
    <div className={estilos.corpo}>
      {exigidos.map((doc) => (
        <Documento key={doc.chave} doc={doc} arquivos={arquivos[doc.chave] ?? []} adicionar={(novos) => aoMudar((a) => ({ ...a, [doc.chave]: [...(a[doc.chave] ?? []), ...novos].slice(0, MAX_ARQUIVOS_POR_DOCUMENTO) }))}
          tirar={(i) => aoMudar((a) => ({ ...a, [doc.chave]: (a[doc.chave] ?? []).filter((_, j) => j !== i) }))} erro={erros[`arquivos.${doc.chave}`]} />
      ))}
    </div>
  )
}
