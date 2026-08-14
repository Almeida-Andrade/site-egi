import type { Unidade } from '@/lib/tipos'

/**
 * Ordena por `ordem` e, em empate, pela identificação com comparação numérica,
 * para que "Loja 2" venha antes de "Loja 10". Ordenação alfabética pura
 * colocaria a 10 primeiro, e o portfólio real tem lojas numeradas de 1 a 20.
 */
export function ordenarUnidades(unidades: Unidade[]): Unidade[] {
  return [...unidades].sort(
    (a, b) =>
      a.ordem - b.ordem ||
      a.identificacao.localeCompare(b.identificacao, 'pt-BR', { numeric: true }),
  )
}
