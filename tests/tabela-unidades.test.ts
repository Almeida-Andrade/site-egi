import { describe, it, expect } from 'vitest'
import { contarPorStatus, temAlgumaArea, temAlgumPiso } from '@/components/site/logicaUnidades'
import type { Unidade } from '@/lib/tipos'

function u(
  status: Unidade['status'],
  area: number | null = null,
  piso: string | null = null,
): Unidade {
  return {
    id: crypto.randomUUID(),
    empreendimento_id: 'x',
    identificacao: 'Loja 1',
    tipo: 'loja',
    area_m2: area,
    piso,
    status,
    disponivel_em: null,
    descricao: null,
    caracteristicas: [],
    ordem: 0,
  }
}

describe('contarPorStatus', () => {
  it('conta cada status', () => {
    const c = contarPorStatus([u('disponivel'), u('disponivel'), u('ocupado')])
    expect(c.disponivel).toBe(2)
    expect(c.ocupado).toBe(1)
    expect(c.reservado).toBe(0)
    expect(c.total).toBe(3)
  })

  it('devolve zeros para lista vazia', () => {
    const c = contarPorStatus([])
    expect(c.total).toBe(0)
    expect(c.disponivel).toBe(0)
  })
})

describe('temAlgumaArea', () => {
  it('é falso quando nenhuma unidade tem área', () => {
    expect(temAlgumaArea([u('ocupado'), u('disponivel')])).toBe(false)
  })

  it('é verdadeiro quando ao menos uma tem', () => {
    expect(temAlgumaArea([u('ocupado'), u('disponivel', 62.5)])).toBe(true)
  })
})

describe('temAlgumPiso', () => {
  it('é falso quando o piso é nulo ou vazio', () => {
    expect(temAlgumPiso([u('ocupado', null, null), u('ocupado', null, '')])).toBe(false)
  })

  it('é verdadeiro quando ao menos uma tem piso', () => {
    expect(temAlgumPiso([u('ocupado'), u('ocupado', null, 'Térreo')])).toBe(true)
  })
})
