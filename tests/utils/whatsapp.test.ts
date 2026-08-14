import { describe, it, expect } from 'vitest'
import { montarLinkWhatsApp } from '@/lib/utils/whatsapp'

describe('montarLinkWhatsApp', () => {
  it('cita o empreendimento', () => {
    const url = montarLinkWhatsApp({ empreendimento: 'Centro Comercial Ana Dina' })
    expect(url).toContain('https://wa.me/5598984812793?text=')
    expect(decodeURIComponent(url)).toContain('Centro Comercial Ana Dina')
  })

  it('cita a unidade quando informada', () => {
    const url = montarLinkWhatsApp({
      empreendimento: 'Centro Comercial Ana Dina',
      unidade: 'Loja 12',
    })
    expect(decodeURIComponent(url)).toContain('Loja 12')
  })

  it('codifica caracteres especiais', () => {
    const url = montarLinkWhatsApp({ empreendimento: 'Olgamérica & Cia' })
    expect(url).not.toContain(' ')
    expect(url).not.toContain('&text')
  })
})
