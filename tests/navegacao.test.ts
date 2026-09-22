import { describe, it, expect } from 'vitest'
import { itemAtivo, ITENS_NAVEGACAO } from '@/lib/navegacao'

describe('itemAtivo', () => {
  it('acende Empreendimentos na listagem', () => {
    expect(itemAtivo('/empreendimentos')).toBe('/empreendimentos')
  })

  it('acende Empreendimentos na ficha de um imóvel', () => {
    expect(itemAtivo('/empreendimentos/residencial-buzios')).toBe('/empreendimentos')
  })

  it('acende À venda na vitrine, e ela fica entre Empreendimentos e A EGI', () => {
    expect(itemAtivo('/a-venda')).toBe('/a-venda')
    const hrefs = ITENS_NAVEGACAO.map((i) => i.href)
    expect(hrefs.indexOf('/a-venda')).toBe(hrefs.indexOf('/empreendimentos') + 1)
    expect(hrefs.indexOf('/sobre')).toBe(hrefs.indexOf('/a-venda') + 1)
  })

  it('acende as páginas institucionais', () => {
    expect(itemAtivo('/sobre')).toBe('/sobre')
    expect(itemAtivo('/contato')).toBe('/contato')
  })

  it('acende Início na home', () => {
    expect(itemAtivo('/')).toBe('/')
  })

  it('não acende nada no painel', () => {
    expect(itemAtivo('/admin')).toBeNull()
    expect(itemAtivo('/admin/empreendimentos')).toBeNull()
  })

  it('não tem mais o filtro de disponíveis como item de menu', () => {
    expect(ITENS_NAVEGACAO.map((i) => i.href)).not.toContain('/empreendimentos?disponiveis=1')
  })

  it('devolve sempre um href que existe no menu', () => {
    const hrefs = ITENS_NAVEGACAO.map((i) => i.href)
    for (const caminho of ['/', '/empreendimentos', '/empreendimentos/x', '/sobre', '/contato']) {
      expect(hrefs).toContain(itemAtivo(caminho))
    }
  })
})
