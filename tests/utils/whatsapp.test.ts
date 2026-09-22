import { describe, it, expect } from 'vitest'
import { linkConsultarValor, montarLinkWhatsApp } from '@/lib/utils/whatsapp'

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

describe('linkConsultarValor', () => {
  it('pede o valor da unidade, ou do imóvel inteiro', () => {
    expect(decodeURIComponent(linkConsultarValor({ empreendimento: "Ville D'Or", unidade: 'Casa 01' }))).toContain(
      "consultar o valor de Casa 01 do Ville D'Or",
    )
    expect(decodeURIComponent(linkConsultarValor({ empreendimento: "Ville D'Or" }))).toContain(
      "consultar o valor de Ville D'Or",
    )
    expect(linkConsultarValor({ empreendimento: 'x' })).toContain('https://wa.me/5598984812793?text=')
  })
})
