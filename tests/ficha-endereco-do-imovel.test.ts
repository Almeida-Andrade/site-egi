import { describe, expect, it } from 'vitest'
import { enderecoDoImovel } from '@/lib/ficha/endereco-do-imovel'
import type { UnidadeDaFicha } from '@/lib/ficha/envio'

const unidade = (rua: string | null, identificacao = 'Loja 3', cep: string | null = null): UnidadeDaFicha => ({
  id: 'u1',
  identificacao,
  imovel: 'Centro Comercial Ana Diná',
  slug: 'ana-dina',
  tipoImovel: 'comercial',
  endereco: { rua, bairro: 'Anjo da Guarda', cidade: 'São Luís', uf: 'ma', cep },
})

describe('endereço do imóvel na ficha', () => {
  it('separa rua e número e põe a unidade no complemento', () => {
    expect(enderecoDoImovel(unidade('R. das Gaivotas, 14'))).toEqual({
      cep: '',
      logradouro: 'R. das Gaivotas',
      numero: '14',
      complemento: 'Loja 3',
      bairro: 'Anjo da Guarda',
      cidade: 'São Luís',
      uf: 'MA',
    })
  })

  it('número com complemento junto fica no número', () => {
    expect(enderecoDoImovel(unidade('Av. dos Portugueses, 100 - 05'))?.numero).toBe('100 - 05')
  })

  it('sem número vira S/N, e texto depois da vírgula que não é número fica na rua', () => {
    expect(enderecoDoImovel(unidade('Rodovia MA-53'))).toMatchObject({ logradouro: 'Rodovia MA-53', numero: 'S/N' })
    expect(enderecoDoImovel(unidade('Jaracati Empresarial, Sala 603', 'Sala 603'))).toMatchObject({
      logradouro: 'Jaracati Empresarial, Sala 603',
      numero: 'S/N',
      complemento: '',
    })
  })

  it('o CEP vem com a máscara quando o imóvel tem', () => {
    expect(enderecoDoImovel(unidade('Av. Brasil, 1135', 'Apto 12', '65071380'))?.cep).toBe('65071-380')
  })

  it('sem unidade ou sem rua no cadastro, não oferece', () => {
    expect(enderecoDoImovel(null)).toBeNull()
    expect(enderecoDoImovel(unidade(null))).toBeNull()
    expect(enderecoDoImovel({ ...unidade('R. A, 1'), endereco: undefined })).toBeNull()
  })
})
