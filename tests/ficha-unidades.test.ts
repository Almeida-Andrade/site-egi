import { describe, expect, it } from 'vitest'
import { juntarUnidades, unidadeExibida } from '@/lib/ficha/unidades'
import type { UnidadeDaFicha } from '@/lib/ficha/envio'

const loja = (id: string, identificacao: string): UnidadeDaFicha => ({ id, identificacao, imovel: 'Centro Comercial Anil Plaza', slug: 'anil-plaza', tipoImovel: 'comercial' })

describe('várias unidades no link', () => {
  it('junta os nomes em português', () => {
    expect(juntarUnidades(['Loja 1'])).toBe('Loja 1')
    expect(juntarUnidades(['Loja 1', 'Loja 2'])).toBe('Loja 1 e Loja 2')
    expect(juntarUnidades(['Loja 1', 'Loja 2', 'Loja 4'])).toBe('Loja 1, Loja 2 e Loja 4')
    expect(juntarUnidades([])).toBe('')
  })

  it('a principal leva o nome de todas; sem a lista, fica como veio', () => {
    const principal = loja('a', 'Loja 4')
    expect(unidadeExibida(principal, [loja('b', 'Loja 1'), principal])).toMatchObject({ id: 'a', identificacao: 'Loja 1 e Loja 4' })
    expect(unidadeExibida(principal, undefined)).toBe(principal)
    expect(unidadeExibida(principal, [principal])).toBe(principal)
    expect(unidadeExibida(null, [principal])).toBeNull()
  })
})
