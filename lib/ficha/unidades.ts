// O link da ficha pode levar mais de uma unidade do mesmo imóvel (um contrato só). A ficha mostra todas
// num nome só ("Loja 1, Loja 2 e Loja 4"), com o endereço do imóvel, que é o mesmo.

import type { UnidadeDaFicha } from './envio'

/** "Loja 1", "Loja 1 e Loja 2", "Loja 1, Loja 2 e Loja 4". */
export function juntarUnidades(identificacoes: readonly string[]): string {
  const l = [...new Set(identificacoes.map((i) => i.trim()).filter(Boolean))]
  return l.length <= 1 ? (l[0] ?? '') : `${l.slice(0, -1).join(', ')} e ${l[l.length - 1]}`
}

/** A unidade que a ficha exibe: a principal, com todas as do link no nome. Sem a lista (function antiga), a principal. */
export function unidadeExibida(principal: UnidadeDaFicha | null, unidades: readonly UnidadeDaFicha[] | undefined): UnidadeDaFicha | null {
  if (!principal) return null
  const todas = (unidades ?? []).filter((u) => u.imovel === principal.imovel)
  if (todas.length <= 1) return principal
  return { ...principal, identificacao: juntarUnidades(todas.map((u) => u.identificacao)) }
}
