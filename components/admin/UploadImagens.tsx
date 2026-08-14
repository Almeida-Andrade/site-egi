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

  async function enviar(arquivos: FileList | null) {
    if (!arquivos?.length) return
    setEnviando(true)
    setErros([])

    const supabase = criarClienteNavegador()
    const novas: Imagem[] = []
    const falhas: string[] = []

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
            capa: imagens.length === 0 && novas.length === 0,
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
    if (novas.length > 0) await revalidarSite(slug)
  }

  async function remover(imagem: Imagem) {
    const supabase = criarClienteNavegador()
    const { error } = await supabase.from('imagens').delete().eq('id', imagem.id)
    if (error) {
      setErros([`Falha ao remover: ${error.message}`])
      return
    }
    await supabase.storage.from('imoveis').remove([imagem.storage_path])
    setImagens(imagens.filter((i) => i.id !== imagem.id))
    await revalidarSite(slug)
  }

  async function definirCapa(imagem: Imagem) {
    const supabase = criarClienteNavegador()
    const { error: erroLimpar } = await supabase
      .from('imagens')
      .update({ capa: false })
      .eq('empreendimento_id', empreendimentoId)
    if (erroLimpar) {
      setErros([`Falha ao definir capa: ${erroLimpar.message}`])
      return
    }

    const { error } = await supabase.from('imagens').update({ capa: true }).eq('id', imagem.id)
    if (error) {
      setErros([`Falha ao definir capa: ${error.message}`])
      return
    }

    setImagens(imagens.map((i) => ({ ...i, capa: i.id === imagem.id })))
    await revalidarSite(slug)
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
