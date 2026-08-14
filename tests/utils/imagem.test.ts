import { describe, it, expect } from 'vitest'
import { calcularDimensoes } from '@/lib/utils/imagem'

describe('calcularDimensoes', () => {
  it('reduz o lado maior para o teto', () => {
    expect(calcularDimensoes(4000, 3000, 1600)).toEqual({ largura: 1600, altura: 1200 })
  })

  it('respeita retrato', () => {
    expect(calcularDimensoes(3000, 4000, 1600)).toEqual({ largura: 1200, altura: 1600 })
  })

  it('não amplia imagem pequena', () => {
    expect(calcularDimensoes(800, 600, 1600)).toEqual({ largura: 800, altura: 600 })
  })

  it('mantém imagem exatamente no teto', () => {
    expect(calcularDimensoes(1600, 900, 1600)).toEqual({ largura: 1600, altura: 900 })
  })
})
