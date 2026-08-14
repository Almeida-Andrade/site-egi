import { describe, it, expect } from 'vitest'
import { gerarSlug } from '@/lib/utils/slug'

describe('gerarSlug', () => {
  it('remove acentos e caixa', () => {
    expect(gerarSlug('Centro Comercial Olgamérica')).toBe('centro-comercial-olgamerica')
  })

  it('trata barras e pontuação', () => {
    expect(gerarSlug('Salas 1105/1106 - Century')).toBe('salas-1105-1106-century')
  })

  it('não deixa hífen nas pontas nem repetido', () => {
    expect(gerarSlug('  Pátio  Aririzal (50%)  ')).toBe('patio-aririzal-50')
  })

  it('preserva números', () => {
    expect(gerarSlug('Apto Est. Mar 134')).toBe('apto-est-mar-134')
  })
})
