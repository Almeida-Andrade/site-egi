import { describe, it, expect } from 'vitest'
import { extrairUrlMaps } from '@/lib/utils/maps'

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
})
