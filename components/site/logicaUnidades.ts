import type { StatusUnidade, Unidade } from '@/lib/tipos'

export type Contagem = Record<StatusUnidade, number> & { total: number }

export function contarPorStatus(unidades: Unidade[]): Contagem {
  const base: Contagem = {
    disponivel: 0,
    ocupado: 0,
    reservado: 0,
    manutencao: 0,
    total: unidades.length,
  }
  for (const u of unidades) base[u.status] += 1
  return base
}

/**
 * O relatório de contratos que originou o portfólio não trazia áreas, então a
 * coluna some da tabela em vez de exibir uma coluna inteira de traços. Volta
 * sozinha assim que a primeira área for cadastrada.
 */
export function temAlgumaArea(unidades: Unidade[]): boolean {
  return unidades.some((u) => u.area_m2 !== null)
}

export function temAlgumPiso(unidades: Unidade[]): boolean {
  return unidades.some((u) => u.piso !== null && u.piso !== '')
}
