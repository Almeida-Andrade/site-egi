import { describe, it, expect } from 'vitest'
import { formatarArea, montarImovelAVenda, semOrientacaoSolar, situacaoDe } from '@/lib/vendas'
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
    { unidade_id: 'u1', situacao: 'a_venda' as const },
    { unidade_id: 'u17', situacao: 'a_venda' as const },
    { unidade_id: 'u4', situacao: 'reservada' as const },
    { unidade_id: 'de-outro-imovel', situacao: 'vendida' as const },
  ]

  it('casa a situação por unidade, ordena as casas e separa as imagens por tipo', () => {
    const r = montarImovelAVenda(linha, vendas)
    expect(r.unidades.map((u) => u.identificacao)).toEqual(['Casa 01', 'Casa 04', 'Casa 17'])
    expect(r.unidades[1].venda?.situacao).toBe('reservada')
    expect(r.unidades.flatMap((u) => u.caracteristicas)).toEqual(['4 quartos', '4 quartos', '4 quartos'])
    expect(r.fotos.map((i) => i.id)).toEqual(['f1', 'f2'])
    expect(r.capa?.id).toBe('f1')
    expect(r.planta?.id).toBe('planta')
    expect(r.logo?.id).toBe('logo')
    expect(r.aVenda).toBe(2)
    expect(r.reservadas).toBe(1)
    expect(r.vendidas).toBe(0)
  })

  it('unidade sem linha na view conta como à venda', () => {
    const r = montarImovelAVenda(linha, [])
    expect(r.unidades.every((u) => u.venda === null)).toBe(true)
    expect(r.unidades.every((u) => situacaoDe(u) === 'a_venda')).toBe(true)
    expect(r.aVenda).toBe(3)
  })

  it('nunca carrega valor: o objeto montado não tem preço em lugar nenhum', () => {
    const r = montarImovelAVenda(linha, vendas)
    expect(JSON.stringify(r)).not.toMatch(/valor|preco/i)
  })
})

describe('formatarArea', () => {
  it('área com vírgula', () => {
    expect(formatarArea(132.75)).toBe('132,75 m²')
    expect(formatarArea(150)).toBe('150 m²')
  })
})

describe('semOrientacaoSolar', () => {
  it('tira nascente e poente das características, sem diferenciar caixa', () => {
    expect(semOrientacaoSolar(['4 quartos', 'Poente (sol da tarde)'])).toEqual(['4 quartos'])
    expect(semOrientacaoSolar(['NASCENTE', 'Sol da manhã', 'Piscina'])).toEqual(['Piscina'])
    expect(semOrientacaoSolar(['4 quartos'])).toEqual(['4 quartos'])
  })
})
