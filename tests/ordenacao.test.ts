import { describe, it, expect } from 'vitest'
import { ordenarUnidades } from '@/lib/dados/ordenacao'
import type { Unidade } from '@/lib/tipos'

function u(identificacao: string, ordem = 0): Unidade {
  return {
    id: identificacao, empreendimento_id: 'x', identificacao, tipo: 'loja',
    area_m2: null, piso: null, status: 'ocupado', disponivel_em: null,
    descricao: null, caracteristicas: [], ordem,
  }
}

describe('ordenarUnidades', () => {
  it('coloca Loja 2 antes de Loja 10 quando a ordem empata', () => {
    const saida = ordenarUnidades([u('Loja 10'), u('Loja 2'), u('Loja 1')])
    expect(saida.map((x) => x.identificacao)).toEqual(['Loja 1', 'Loja 2', 'Loja 10'])
  })

  it('respeita o campo ordem antes da identificação', () => {
    const saida = ordenarUnidades([u('Loja 1', 5), u('Loja 9', 1)])
    expect(saida.map((x) => x.identificacao)).toEqual(['Loja 9', 'Loja 1'])
  })

  it('não altera o array recebido', () => {
    const entrada = [u('Loja 10'), u('Loja 2')]
    ordenarUnidades(entrada)
    expect(entrada.map((x) => x.identificacao)).toEqual(['Loja 10', 'Loja 2'])
  })
})
