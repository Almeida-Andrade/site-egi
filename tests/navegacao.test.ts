import { describe, it, expect } from 'vitest'
import { itemAtivo, ITENS_NAVEGACAO } from '@/lib/navegacao'

describe('itemAtivo', () => {
  it('acende Empreendimentos na listagem', () => {
    expect(itemAtivo('/empreendimentos')).toBe('/empreendimentos')
  })

  it('acende Empreendimentos na ficha de um imóvel', () => {
    expect(itemAtivo('/empreendimentos/residencial-buzios')).toBe('/empreendimentos')
  })

  it('acende as páginas institucionais', () => {
    expect(itemAtivo('/sobre')).toBe('/sobre')
    expect(itemAtivo('/contato')).toBe('/contato')
  })

  it('não acende nada na home nem no painel', () => {
    expect(itemAtivo('/')).toBeNull()
    expect(itemAtivo('/admin')).toBeNull()
  })

  it('devolve sempre um href que existe no menu', () => {
    const hrefs = ITENS_NAVEGACAO.map((i) => i.href)
    for (const caminho of ['/empreendimentos', '/empreendimentos/x', '/sobre', '/contato']) {
      expect(hrefs).toContain(itemAtivo(caminho))
    }
  })
})
