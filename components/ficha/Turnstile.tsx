'use client'

import { useEffect, useRef } from 'react'

interface ApiTurnstile {
  render: (alvo: HTMLElement, opcoes: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: ApiTurnstile
  }
}

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
let carregando: Promise<ApiTurnstile> | null = null

function carregar(): Promise<ApiTurnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  carregando ??= new Promise((ok, falhou) => {
    const s = document.createElement('script')
    s.src = SCRIPT
    s.async = true
    s.onload = () => (window.turnstile ? ok(window.turnstile) : falhou(new Error('sem turnstile')))
    s.onerror = () => {
      carregando = null
      falhou(new Error('o Turnstile não carregou'))
    }
    document.head.appendChild(s)
  })
  return carregando
}

/**
 * A verificação da Cloudflare: no modo gerenciado a caixa só aparece quando ela desconfia.
 * O token vale uma vez e por 5 minutos; quem confere é a function, com a chave secreta.
 */
export function Turnstile({ aoReceber, aoFalhar, aoPedirCaixa }: { aoReceber: (token: string | null) => void; aoFalhar: (mensagem: string) => void; aoPedirCaixa: () => void }) {
  const alvo = useRef<HTMLDivElement>(null)
  const chave = process.env.NEXT_PUBLIC_TURNSTILE_FICHA_SITE_KEY

  useEffect(() => {
    if (!chave) {
      aoFalhar('A verificação de segurança não está configurada. Fale com a EGI pelo WhatsApp.')
      return
    }
    let id: string | null = null
    let ativo = true
    carregar()
      .then((api) => {
        if (!ativo || !alvo.current) return
        id = api.render(alvo.current, {
          sitekey: chave,
          action: 'ficha',
          appearance: 'interaction-only',
          language: 'pt-br',
          callback: (token: string) => aoReceber(token),
          'expired-callback': () => aoReceber(null),
          'before-interactive-callback': () => aoPedirCaixa(),
          'error-callback': () => {
            aoReceber(null)
            aoFalhar('A verificação de segurança falhou. Recarregue a página e tente de novo.')
          },
        })
      })
      .catch(() => aoFalhar('A verificação de segurança não carregou. Confira a internet e recarregue a página.'))
    return () => {
      ativo = false
      if (id && window.turnstile) window.turnstile.remove(id)
    }
  }, [chave, aoReceber, aoFalhar, aoPedirCaixa])

  return <div ref={alvo} />
}

