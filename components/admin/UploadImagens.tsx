'use client'

import { useState } from 'react'
import Image from 'next/image'
import { criarClienteNavegador } from '@/lib/supabase/client'
import { comprimirImagem } from '@/lib/utils/imagem'
import { urlImagem } from '@/lib/utils/rotulos'
import { revalidarSite } from '@/lib/dados/admin'
import type { Imagem } from '@/lib/tipos'
import estilos from './UploadImagens.module.css'

export function UploadImagens({
  empreendimentoId,
  slug,
  iniciais,
}: {
  empreendimentoId: string
  slug: string
  iniciais: Imagem[]
}) {
  const [imagens, setImagens] = useState(iniciais)
  const [enviando, setEnviando] = useState(false)
  const [erros, setErros] = useState<string[]>([])
  const [aviso, setAviso] = useState<string | null>(null)

  async function revalidar() {
    try {
      await revalidarSite(slug)
    } catch {
      setAviso('Alteração salva, mas o site público pode levar até um minuto para refletir.')
    }
  }

  async function enviar(arquivos: FileList | null) {
    if (!arquivos?.length) return
    setEnviando(true)
    setErros([])
    setAviso(null)

    const supabase = criarClienteNavegador()
    const novas: Imagem[] = []
    const falhas: string[] = []
    const jaTemCapa = imagens.some((i) => i.capa)

    // O try fica dentro do laço de propósito: uma foto corrompida no meio de
    // dez não pode derrubar as outras nove.
    for (const arquivo of Array.from(arquivos)) {
      try {
        const blob = await comprimirImagem(arquivo)
        const caminho = `empreendimentos/${empreendimentoId}/${crypto.randomUUID()}.webp`

        const { error: erroUpload } = await supabase.storage
          .from('imoveis')
          .upload(caminho, blob, { contentType: 'image/webp' })
        if (erroUpload) throw erroUpload

        const { data, error } = await supabase
          .from('imagens')
          .insert({
            empreendimento_id: empreendimentoId,
            storage_path: caminho,
            alt: arquivo.name.replace(/\.[^.]+$/, ''),
            capa: !jaTemCapa && novas.length === 0,
            ordem: imagens.length + novas.length,
          })
          .select()
          .single()

        if (error) {
          // O arquivo já subiu; sem a linha ele viraria lixo no bucket.
          await supabase.storage.from('imoveis').remove([caminho])
          throw error
        }

        novas.push(data as Imagem)
      } catch (e) {
        falhas.push(`${arquivo.name}: ${(e as Error).message}`)
      }
    }

    setImagens([...imagens, ...novas])
    setErros(falhas)
    setEnviando(false)
    if (novas.length > 0) await revalidar()
  }

  async function remover(imagem: Imagem) {
    if (!confirm('Remover esta foto? A exclusão é definitiva — não há como desfazer.')) return

    setErros([])
    setAviso(null)
    const supabase = criarClienteNavegador()

    const { error } = await supabase.from('imagens').delete().eq('id', imagem.id)
    if (error) {
      setErros([`Falha ao remover: ${error.message}`])
      return
    }

    const { error: erroStorage } = await supabase.storage
      .from('imoveis')
      .remove([imagem.storage_path])
    if (erroStorage) {
      setAviso(
        `A foto saiu do site, mas o arquivo permaneceu no armazenamento: ${erroStorage.message}`,
      )
    }

    const restantes = imagens.filter((i) => i.id !== imagem.id)

    // Apagar a capa deixaria o empreendimento sem nenhuma — promove a próxima.
    if (imagem.capa && restantes.length > 0) {
      const sucessora = restantes[0]
      const { error: erroCapa } = await supabase
        .from('imagens')
        .update({ capa: true })
        .eq('id', sucessora.id)

      if (erroCapa) {
        setErros([`Foto removida, mas nenhuma capa foi definida: ${erroCapa.message}`])
        setImagens(restantes)
        return
      }
      setImagens(restantes.map((i) => ({ ...i, capa: i.id === sucessora.id })))
    } else {
      setImagens(restantes)
    }

    await revalidar()
  }

  async function definirCapa(imagem: Imagem) {
    setErros([])
    setAviso(null)
    const supabase = criarClienteNavegador()

    // Marca a nova capa primeiro. Se o segundo passo falhar, o empreendimento
    // fica com duas capas — visualmente inofensivo — em vez de nenhuma.
    const { error } = await supabase.from('imagens').update({ capa: true }).eq('id', imagem.id)
    if (error) {
      setErros([`Falha ao definir capa: ${error.message}`])
      return
    }

    const { error: erroLimpar } = await supabase
      .from('imagens')
      .update({ capa: false })
      .eq('empreendimento_id', empreendimentoId)
      .neq('id', imagem.id)

    if (erroLimpar) {
      setErros([`Capa definida, mas a anterior não foi desmarcada: ${erroLimpar.message}`])
      return
    }

    setImagens(imagens.map((i) => ({ ...i, capa: i.id === imagem.id })))
    await revalidar()
  }

  return (
    <div>
      <label className={estilos.zona}>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => enviar(e.target.files)}
          disabled={enviando}
        />
        <span>{enviando ? 'Enviando…' : 'Escolher fotos ou arrastar para cá'}</span>
        <small>As fotos são reduzidas automaticamente antes do envio.</small>
      </label>

      {erros.length > 0 && (
        <ul className={estilos.erros}>
          {erros.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      {aviso && <p className={estilos.aviso}>{aviso}</p>}

      <div className={estilos.grade}>
        {imagens.map((img) => (
          <figure key={img.id} className={img.capa ? estilos.itemCapa : estilos.item}>
            <Image
              src={urlImagem(img.storage_path)}
              alt={img.alt ?? ''}
              fill
              sizes="200px"
              style={{ objectFit: 'cover' }}
            />
            <figcaption>
              {!img.capa && (
                <button type="button" onClick={() => definirCapa(img)}>
                  Capa
                </button>
              )}
              <button type="button" onClick={() => remover(img)}>
                Remover
              </button>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
