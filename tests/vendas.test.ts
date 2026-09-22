import { describe, it, expect } from 'vitest'
import {
  formatarArea, formatarPreco, menorPreco, montarImovelAVenda, orientacaoSolar, precoCurto,
} from '@/lib/vendas'
import type { Empreendimento, Imagem, Unidade } from '@/lib/tipos'

const imovel: Empreendimento = {
  id: 'e1', slug: 'ville-dor', nome: "Ville D'Or", descricao: null, tipo: 'casa',
  built_to_suit: false, endereco: 'Rua Barão de Grajaú, 6', bairro: "Olho d'Água",
  cidade: 'São Luís', uf: 'MA', cep: null, localizacao_aproximada: false,
  maps_embed_url: null, maps_link: null, publicado: true, destaque: false, ordem: 100,
  finalidade: 'venda', video_url: null,
}

const casa = (id: string, identificacao: string, sol: string): Unidade => ({
  id, empreendimento_id: 'e1', identificacao, tipo: 'casa', area_m2: 132.75, piso: null,
  status: 'disponivel', disponivel_em: null, descricao: null,
  caracteristicas: ['4 quartos', sol], ordem: Number(identificacao.replace(/\D/g, '')),
})

const img = (id: string, tipo: Imagem['tipo'], ordem: number, capa = false): Imagem => ({
  id, storage_path: '', url: `https://x/${id}`, alt: null, capa, ordem, tipo,
})

describe('montarImovelAVenda', () => {
  const linha = {
    ...imovel,
    unidades: [casa('u17', 'Casa 17', 'Nascente (sol da manhã)'), casa('u1', 'Casa 01', 'Poente (sol da tarde)'), casa('u4', 'Casa 04', 'Poente')],
    imagens: [img('logo', 'logo', 21), img('f1', 'foto', 1, true), img('planta', 'planta', 20), img('f2', 'foto', 2)],
  }
  const vendas = [
    { unidade_id: 'u1', valor_venda: 1408734.8, situacao: 'a_venda' as const },
    { unidade_id: 'u17', valor_venda: 1447054, situacao: 'a_venda' as const },
    { unidade_id: 'u4', valor_venda: 1408734.8, situacao: 'reservada' as const },
    { unidade_id: 'de-outro-imovel', valor_venda: 1, situacao: 'a_venda' as const },
  ]

  it('casa o preço por unidade, ordena as casas e separa as imagens por tipo', () => {
    const r = montarImovelAVenda(linha, vendas)
    expect(r.unidades.map((u) => u.identificacao)).toEqual(['Casa 01', 'Casa 04', 'Casa 17'])
    expect(r.unidades[0].venda?.valor_venda).toBe(1408734.8)
    expect(r.unidades[1].venda?.situacao).toBe('reservada')
    expect(r.fotos.map((i) => i.id)).toEqual(['f1', 'f2'])
    expect(r.capa?.id).toBe('f1')
    expect(r.planta?.id).toBe('planta')
    expect(r.logo?.id).toBe('logo')
    expect(r.aVenda).toBe(2)
    expect(r.reservadas).toBe(1)
    expect(r.vendidas).toBe(0)
    expect(r.menorPreco).toBe(1408734.8)
  })

  it('unidade sem linha na view fica sem preço (sob consulta), nunca zero', () => {
    const r = montarImovelAVenda(linha, [])
    expect(r.unidades.every((u) => u.venda === null)).toBe(true)
    expect(r.menorPreco).toBeNull()
    expect(r.aVenda).toBe(0)
  })

  it('valor vindo como texto do PostgREST vira número', () => {
    const r = montarImovelAVenda(linha, [
      { unidade_id: 'u1', valor_venda: '1408734.80' as unknown as number, situacao: 'a_venda' },
    ])
    expect(r.unidades[0].venda?.valor_venda).toBe(1408734.8)
  })
})

describe('menorPreco', () => {
  it('ignora reservada e vendida', () => {
    const u = (id: string, situacao: 'a_venda' | 'reservada' | 'vendida', valor: number) => ({
      ...casa(id, id, ''), venda: { unidade_id: id, valor_venda: valor, situacao },
    })
    expect(menorPreco([u('a', 'vendida', 1), u('b', 'a_venda', 3), u('c', 'a_venda', 2), u('d', 'reservada', 0.5)])).toBe(2)
    expect(menorPreco([u('a', 'vendida', 1)])).toBeNull()
  })
})

describe('formatação', () => {
  it('preço sempre com centavos, em pt-BR', () => {
    expect(formatarPreco(1408734.8).replace(/ /g, ' ')).toBe('R$ 1.408.734,80')
    expect(formatarPreco(1447054).replace(/ /g, ' ')).toBe('R$ 1.447.054,00')
  })

  it('preço curto para o cartão', () => {
    expect(precoCurto(1408734.8)).toBe('R$ 1,41 mi')
    expect(precoCurto(850000)).toBe('R$ 850 mil')
    expect(precoCurto(900).replace(/ /g, ' ')).toBe('R$ 900,00')
  })

  it('área com vírgula', () => {
    expect(formatarArea(132.75)).toBe('132,75 m²')
    expect(formatarArea(150)).toBe('150 m²')
  })
})

describe('orientacaoSolar', () => {
  it('acha o sol nas características, sem diferenciar caixa', () => {
    expect(orientacaoSolar(['4 quartos', 'Poente (sol da tarde)'])).toBe('Poente (sol da tarde)')
    expect(orientacaoSolar(['NASCENTE'])).toBe('NASCENTE')
    expect(orientacaoSolar(['4 quartos'])).toBeNull()
  })
})
