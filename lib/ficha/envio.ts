// A conversa do navegador com a function ficha-cadastral do OMNIS. Nenhuma tabela é tocada daqui:
// a function confere tudo e devolve uma URL de envio por arquivo, no bucket privado.

import { createClient } from '@supabase/supabase-js'
import type { ErroCampo } from '@/lib/ficha-cadastral'

const URL_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const URL_FUNCAO = `${URL_SUPABASE}/functions/v1/ficha-cadastral`
const LADO_MAXIMO_FOTO = 2000

export interface UnidadeDaFicha {
  id: string
  identificacao: string
  imovel: string
  slug: string
  tipoImovel: string
}

export interface Preenchido {
  tipo: string | null
  nome: string
  celular: string
  email: string
}

export type Abertura =
  | { ok: true; enviada: false; unidade: UnidadeDaFicha; preenchido: Preenchido | null }
  | { ok: true; enviada: true; quando: string }
  | { ok: false; mensagem: string }

interface Resposta {
  ok?: boolean
  mensagem?: string
  erros?: ErroCampo[]
  [chave: string]: unknown
}

async function chamar(corpo: Record<string, unknown>): Promise<{ status: number; json: Resposta }> {
  try {
    const r = await fetch(URL_FUNCAO, {
      method: 'POST',
      headers: { Authorization: `Bearer ${ANON}`, apikey: ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    })
    const json = (await r.json().catch(() => ({}))) as Resposta
    return { status: r.status, json }
  } catch {
    return { status: 0, json: { ok: false, mensagem: 'Sem conexão com a internet. Confira e tente de novo.' } }
  }
}

export async function abrirFicha(alvo: { token: string } | { unidadeId: string }): Promise<Abertura> {
  const { json } = await chamar({ acao: 'abrir', ...alvo })
  if (json.ok === true) return json as unknown as Abertura
  return { ok: false, mensagem: json.mensagem ?? 'Não conseguimos abrir a ficha agora. Tente de novo em alguns minutos.' }
}

/** Foto vira JPEG de até 2000 px (o documento continua legível, o envio fica leve e os dados de GPS saem). */
export async function prepararArquivo(arquivo: File): Promise<File> {
  if (arquivo.type === 'application/pdf') return arquivo
  const imagem = await createImageBitmap(arquivo).catch(() => null)
  if (!imagem) throw new Error('Não conseguimos abrir esta imagem. Tire a foto de novo ou envie em PDF.')
  const escala = Math.min(1, LADO_MAXIMO_FOTO / Math.max(imagem.width, imagem.height))
  const tela = document.createElement('canvas')
  tela.width = Math.round(imagem.width * escala)
  tela.height = Math.round(imagem.height * escala)
  tela.getContext('2d')?.drawImage(imagem, 0, 0, tela.width, tela.height)
  imagem.close()
  const blob = await new Promise<Blob | null>((ok) => tela.toBlob(ok, 'image/jpeg', 0.85))
  if (!blob) throw new Error('Não conseguimos preparar esta foto. Tente outra.')
  const nome = arquivo.name.replace(/\.[^.]*$/, '') || 'foto'
  return new File([blob], `${nome}.jpg`, { type: 'image/jpeg' })
}

export interface ArquivoDaFicha {
  documento: string
  arquivo: File
}

export type ResultadoEnvio = { ok: true } | { ok: false; mensagem: string; erros?: ErroCampo[] }

export async function enviarFicha(
  alvo: { token: string } | { unidadeId: string },
  dados: Record<string, unknown>,
  arquivos: ArquivoDaFicha[],
  turnstile: string,
  aoProgredir: (feitos: number, total: number) => void,
): Promise<ResultadoEnvio> {
  const pedido = arquivos.map((a) => ({ documento: a.documento, tipo: a.arquivo.type, bytes: a.arquivo.size, nome: a.arquivo.name }))
  const inicio = await chamar({ acao: 'iniciar', ...alvo, dados, arquivos: pedido, turnstile })
  if (inicio.json.ok !== true) {
    return { ok: false, mensagem: inicio.json.mensagem ?? 'Não conseguimos enviar agora. Tente de novo.', erros: inicio.json.erros }
  }
  const { fichaId, recibo, envios } = inicio.json as unknown as { fichaId: number; recibo: string; envios: { caminho: string; token: string }[] }
  if (!Array.isArray(envios) || envios.length !== arquivos.length) return { ok: false, mensagem: 'Não conseguimos enviar agora. Tente de novo.' }

  const storage = createClient(URL_SUPABASE, ANON, { auth: { persistSession: false } }).storage.from('fichas')
  aoProgredir(0, arquivos.length)
  for (let i = 0; i < arquivos.length; i++) {
    const { error } = await storage.uploadToSignedUrl(envios[i].caminho, envios[i].token, arquivos[i].arquivo, { contentType: arquivos[i].arquivo.type })
    if (error) return { ok: false, mensagem: 'Um documento não subiu (a internet pode ter caído). Toque em "Enviar ficha" de novo.' }
    aoProgredir(i + 1, arquivos.length)
  }

  const fim = await chamar({ acao: 'concluir', fichaId, recibo })
  if (fim.json.ok !== true) return { ok: false, mensagem: fim.json.mensagem ?? 'Não conseguimos concluir o envio. Tente de novo.' }
  return { ok: true }
}
