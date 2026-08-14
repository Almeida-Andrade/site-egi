import { describe, it, expect } from 'vitest'
import { extrairUrlMaps, linkBuscaMaps } from '@/lib/utils/maps'

const EMBED = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.2'

describe('extrairUrlMaps', () => {
  it('aceita a URL de embed direta', () => {
    expect(extrairUrlMaps(EMBED)).toBe(EMBED)
  })

  it('extrai a URL de dentro do iframe colado', () => {
    const iframe = `<iframe src="${EMBED}" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`
    expect(extrairUrlMaps(iframe)).toBe(EMBED)
  })

  it('aceita aspas simples no iframe', () => {
    expect(extrairUrlMaps(`<iframe src='${EMBED}'></iframe>`)).toBe(EMBED)
  })

  it('rejeita URL que não é do Google Maps', () => {
    expect(extrairUrlMaps('https://exemplo.com/mapa')).toBeNull()
  })

  it('rejeita iframe apontando para outro domínio', () => {
    expect(extrairUrlMaps('<iframe src="https://evil.com/x"></iframe>')).toBeNull()
  })

  it('rejeita texto vazio', () => {
    expect(extrairUrlMaps('   ')).toBeNull()
  })

  it('rejeita caminho não exato /maps/embedded', () => {
    expect(extrairUrlMaps('https://www.google.com/maps/embedded?pb=X')).toBeNull()
  })

  it('rejeita URL com credenciais embutidas', () => {
    expect(extrairUrlMaps('https://user:pass@www.google.com/maps/embed?pb=X')).toBeNull()
  })

  it('extrai iframe correto quando img src precede', () => {
    const iframeCorreto = `<img src="https://evil.com/x"><iframe src="${EMBED}"></iframe>`
    expect(extrairUrlMaps(iframeCorreto)).toBe(EMBED)
  })
})

describe('linkBuscaMaps', () => {
  const galeriaA = {
    endereco: 'Av. dos Sambaquis, 34',
    bairro: 'Calhau',
    cidade: 'São Luís',
    uf: 'MA',
    localizacao_aproximada: false,
  }

  it('monta a busca com endereço, bairro, cidade e UF', () => {
    expect(linkBuscaMaps(galeriaA)).toBe(
      'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent('Av. dos Sambaquis, 34, Calhau, São Luís, MA, Brasil'),
    )
  })

  it('escapa o endereço em vez de concatenar cru', () => {
    const link = linkBuscaMaps({ ...galeriaA, endereco: 'Rua A & B, 1' })!
    expect(link).toContain('Rua%20A%20%26%20B')
    expect(link).not.toContain('&query=Rua A')
  })

  it('omite o bairro quando não há', () => {
    expect(linkBuscaMaps({ ...galeriaA, bairro: null })).toBe(
      'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent('Av. dos Sambaquis, 34, São Luís, MA, Brasil'),
    )
  })

  it('não gera link quando a localização é aproximada', () => {
    expect(linkBuscaMaps({ ...galeriaA, localizacao_aproximada: true })).toBeNull()
  })

  it('não gera link sem endereço', () => {
    expect(linkBuscaMaps({ ...galeriaA, endereco: null })).toBeNull()
  })
})
