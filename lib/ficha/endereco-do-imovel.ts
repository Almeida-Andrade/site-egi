// "Usar o endereço do imóvel que vou alugar": o cadastro do imóvel guarda a rua e o número num texto só
// ("R. das Gaivotas, 14"); a ficha pede os dois separados, e a unidade vai no complemento.

import type { UnidadeDaFicha } from './envio'
import type { EnderecoR } from './etapas'
import { mascaraCep } from './mascaras'

export function enderecoDoImovel(u: UnidadeDaFicha | null): EnderecoR | null {
  const e = u?.endereco
  const rua = e?.rua?.trim()
  if (!u || !e || !rua) return null
  const virgula = rua.lastIndexOf(',')
  const depois = virgula >= 0 ? rua.slice(virgula + 1).trim() : ''
  const temNumero = /^(\d|s\/?n\b)/i.test(depois)
  const unidade = u.identificacao.trim()
  return {
    cep: mascaraCep(e.cep ?? ''),
    logradouro: temNumero ? rua.slice(0, virgula).trim() : rua,
    numero: temNumero ? depois : 'S/N',
    complemento: unidade && !rua.toLowerCase().includes(unidade.toLowerCase()) ? unidade : '',
    bairro: e.bairro?.trim() ?? '',
    cidade: e.cidade?.trim() ?? '',
    uf: (e.uf ?? '').trim().toUpperCase().slice(0, 2),
  }
}
